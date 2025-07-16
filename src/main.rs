use axum::{
    Json, Router,
    extract::{
        State,
        ws::{Message, WebSocket, WebSocketUpgrade},
    },
    http::method::Method,
    response::IntoResponse,
    routing::get,
};
use futures_util::{SinkExt, stream::StreamExt};
use rand::prelude::IndexedRandom;
use std::{
    collections::HashSet,
    sync::{Arc, Mutex},
};
use tokio::sync::broadcast;
use tower::ServiceBuilder;
use tower_http::{
    cors::{Any, CorsLayer},
    services::ServeDir,
};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

struct AppState {
    clients: Mutex<HashSet<String>>,
    tx: broadcast::Sender<String>,
}

#[tokio::main]
async fn main() {
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| format!("{}=trace", env!("CARGO_CRATE_NAME")).into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let _static_frontend = ServeDir::new("site/build");

    let clients = Mutex::new(HashSet::new());
    let (tx, _rx) = broadcast::channel(20);

    let app_state = Arc::new(AppState { clients, tx });

    let access = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(vec![Method::GET, Method::POST]);

    let app = Router::new()
        .route("/ws", get(socket_handler))
        .route("/allowed-names", get(get_allowed_names))
        .layer(ServiceBuilder::new().layer(access))
        .with_state(app_state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000")
        .await
        .unwrap();
    tracing::debug!("listening on {}", listener.local_addr().unwrap());
    axum::serve(listener, app).await.unwrap();
}

static AVAILABLE_NAMES: &[&str] = &[
    "Kangaroo", "Koala", "Owl", "Panda", "Penguin", "Pig", "Rabbit", "Mouse", "Shark", "Snake",
];

async fn socket_handler(
    ws: WebSocketUpgrade,
    State(state): State<Arc<AppState>>,
) -> impl IntoResponse {
    ws.on_upgrade(|socket| websocket(socket, state))
}

// This function deals with a single websocket connection, i.e., a single
// connected client / user, for which we will spawn two independent tasks (for
// receiving / sending chat messages).
async fn websocket(stream: WebSocket, state: Arc<AppState>) {
    // By splitting, we can send and receive at the same time.
    let (mut sender, mut receiver) = stream.split();

    let username = {
        let mut rng = rand::rng();
        let mut name = String::new();
        let available: Vec<_> = AVAILABLE_NAMES
            .iter()
            .filter(|n| !state.clients.lock().unwrap().contains(**n))
            .collect();
        if let Some(&&random_name) = available.choose(&mut rng) {
            check_username(&state, &mut name, random_name);
        }
        name
    };

    let mut rx = state.tx.subscribe();

    sender
        .send(format!("CM|IDENT|{username}").into())
        .await
        .unwrap();

    let client_names: Vec<String> = state.clients.lock().unwrap().iter().cloned().collect();

    sender
        .send(format!("CM|ACTIVE|{}", client_names.join("|")).into())
        .await
        .unwrap();

    // Debug log join action.
    let msg = format!("{username} joined.");
    tracing::debug!("{msg}");
    let _ = state.tx.send(format!("CM|ENTER|{}", username));

    // Spawn the first task that will receive broadcast messages and send text
    // messages over the websocket to our client.
    let mut send_task = tokio::spawn(async move {
        while let Ok(msg) = rx.recv().await {
            // In any websocket error, break loop.
            if sender.send(Message::text(msg)).await.is_err() {}
        }
    });

    // Clone things we want to pass (move) to the receiving task.
    let tx = state.tx.clone();

    // Spawn a task that takes messages from the websocket, prepends the user
    // name, and sends them to all broadcast subscribers.
    let mut recv_task = tokio::spawn(async move {
        while let Some(Ok(Message::Text(text))) = receiver.next().await {
            // Add username before message.
            let _ = tx.send(format!("{text}"));
        }
    });

    // If any one of the tasks run to completion, we abort the other.
    tokio::select! {
        _ = &mut send_task => recv_task.abort(),
        _ = &mut recv_task => send_task.abort(),
    };

    // Send "user left" message (similar to "joined" above).
    let msg = format!("{username} left.");
    tracing::debug!("{msg}");
    let _ = state.tx.send(format!("CM|LEAVE|{}", username));

    // Remove username from map so new clients can take it again.
    state.clients.lock().unwrap().remove(&username);
}

fn check_username(state: &AppState, string: &mut String, name: &str) {
    let mut clients = state.clients.lock().unwrap();

    if !clients.contains(name) {
        clients.insert(name.to_owned());

        string.push_str(name);
    }
}

async fn get_allowed_names(State(state): State<Arc<AppState>>) -> impl IntoResponse {
    let mut allowed_names = AVAILABLE_NAMES.to_vec();

    let clients = state.clients.lock().unwrap();

    // Remove any names that are already taken by connected clients.
    allowed_names.retain(|name| !clients.contains(*name));

    println!("Current clients: {:?}", *clients);
    println!("Allowed names: {:?}", allowed_names);

    Json(allowed_names)
}
