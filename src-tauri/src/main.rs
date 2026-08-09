// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::menu::{Menu, MenuItem};
use tauri::tray::TrayIconBuilder;
use tauri::Manager;
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};
use tauri_plugin_notification::NotificationExt;

fn main() {
    let toggle_shortcut = Shortcut::new(Some(Modifiers::CONTROL | Modifiers::SHIFT), Code::Space);

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(move |app, shortcut, event| {
                    if shortcut == &toggle_shortcut {
                        if event.state == ShortcutState::Pressed {
                            if let Some(window) = app.get_webview_window("main") {
                                if window.is_visible().unwrap_or(false) {
                                    let _ = window.hide();
                                } else {
                                    let _ = window.show();
                                    let _ = window.set_focus();
                                }
                            }
                        }
                    }
                })
                .build(),
        )
        .setup(move |app| {
            // Register the shortcut globally with error handling fallback
            if let Err(e) = app.global_shortcut().register(toggle_shortcut) {
                eprintln!("Failed to register global shortcut: {}", e);
                let _ = app.notification().builder()
                    .title("MSK Error")
                    .body("Failed to register global shortcut (Ctrl+Shift+Space). The app is still accessible via the System Tray.")
                    .show();
            }

            // Create Menu Items
            let show_i = MenuItem::with_id(app, "show", "Show Overlay", true, None::<&str>)?;
            let hide_i = MenuItem::with_id(app, "hide", "Hide Overlay", true, None::<&str>)?;
            let settings_i = MenuItem::with_id(app, "settings", "Open Settings", true, None::<&str>)?;
            let restart_i = MenuItem::with_id(app, "restart", "Restart", true, None::<&str>)?;
            let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            
            let menu = Menu::with_items(app, &[
                &show_i,
                &hide_i,
                &settings_i,
                &restart_i,
                &quit_i,
            ])?;

            // Create Tray
            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .menu(&menu)
                .on_menu_event(move |app, event| {
                    match event.id().as_ref() {
                        "show" => {
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                        "hide" => {
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.hide();
                            }
                        }
                        "settings" => {
                            if let Some(window) = app.get_webview_window("management") {
                                let _ = window.show();
                                let _ = window.set_focus();
                            } else {
                                if let Ok(window) = tauri::WebviewWindowBuilder::new(
                                    app,
                                    "management",
                                    tauri::WebviewUrl::App("/".into())
                                )
                                .title("MSK Management")
                                .inner_size(1280.0, 830.0)
                                .min_inner_size(800.0, 600.0)
                                .center()
                                .transparent(true)
                                .decorations(false)
                                .shadow(true)
                                .build() {
                                    let _ = window.set_content_protected(true);
                                }
                            }
                        }
                        "restart" => {
                            app.restart();
                        }
                        "quit" => {
                            app.exit(0);
                        }
                        _ => {}
                    }
                })
                .build(app)?;

            // Setup Main Window
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.set_always_on_top(true);
                let _ = window.set_content_protected(true);
                
                #[cfg(debug_assertions)]
                {
                    let _ = window.show();
                    let _ = window.set_focus();
                }
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
