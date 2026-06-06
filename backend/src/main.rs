mod errors;
mod handlers;
mod models;

use actix_cors::Cors;
use actix_web::{middleware, web, App, HttpServer};

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenvy::dotenv().ok();
    env_logger::init();

    let database_url = std::env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let pool = sqlx::PgPool::connect(&database_url)
        .await
        .expect("データベース接続に失敗しました");

    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .expect("マイグレーションに失敗しました");

    log::info!("サーバーを起動します: http://0.0.0.0:8080");

    HttpServer::new(move || {
        let cors = Cors::default()
            .allow_any_origin()
            .allowed_methods(vec!["GET", "POST", "PUT", "DELETE", "OPTIONS"])
            .allowed_headers(vec![
                actix_web::http::header::CONTENT_TYPE,
                actix_web::http::header::ACCEPT,
            ])
            .max_age(3600);

        App::new()
            .app_data(web::Data::new(pool.clone()))
            .app_data(
                web::JsonConfig::default()
                    .error_handler(|err, _| {
                        let msg = err.to_string();
                        actix_web::error::InternalError::from_response(
                            err,
                            actix_web::HttpResponse::BadRequest().json(serde_json::json!({
                                "error": { "code": "INVALID_JSON", "message": msg }
                            })),
                        )
                        .into()
                    }),
            )
            .wrap(middleware::Logger::default())
            .wrap(cors)
            .service(
                web::scope("/api/v1")
                    .route("/employees",
                        web::get().to(handlers::employees::list_employees))
                    .route("/employees",
                        web::post().to(handlers::employees::create_employee))
                    .route("/employees/{id}",
                        web::get().to(handlers::employees::get_employee))
                    .route("/employees/{id}",
                        web::put().to(handlers::employees::update_employee))
                    .route("/employees/{id}/histories",
                        web::get().to(handlers::personnel_histories::list_histories))
                    .route("/employees/{id}/histories",
                        web::post().to(handlers::personnel_histories::create_history)),
            )
    })
    .bind("0.0.0.0:8080")?
    .run()
    .await
}
