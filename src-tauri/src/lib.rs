use tauri_plugin_shell::ShellExt;
use tauri::{
    menu::{Menu, MenuItem},
    tray::{TrayIconBuilder, TrayIconEvent},
    AppHandle, Manager,
};

#[tauri::command]
async fn connect(app: AppHandle) -> Result<String, String> {
    let output = app
        .shell()
        .command("warp-cli")
        .args(["connect"])
        .output()
        .await
        .map_err(|e| e.to_string())?;
    
    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[tauri::command]
async fn disconnect(app: AppHandle) -> Result<String, String> {
    let output = app
        .shell()
        .command("warp-cli")
        .args(["disconnect"])
        .output()
        .await
        .map_err(|e| e.to_string())?;
    
    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[tauri::command]
async fn get_status(app: AppHandle) -> Result<String, String> {
    let output = app
        .shell()
        .command("warp-cli")
        .args(["status"])
        .output()
        .await
        .map_err(|e| e.to_string())?;
        
    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}

#[tauri::command]
async fn get_settings(app: AppHandle) -> Result<String, String> {
    let output = app
        .shell()
        .command("warp-cli")
        .args(["settings"])
        .output()
        .await
        .map_err(|e| e.to_string())?;
        
    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}

#[tauri::command]
async fn set_mode(app: AppHandle, mode: String) -> Result<String, String> {
    let output = app
        .shell()
        .command("warp-cli")
        .args(["mode", &mode])
        .output()
        .await
        .map_err(|e| e.to_string())?;
        
    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .on_window_event(|window, event| match event {
            tauri::WindowEvent::CloseRequested { api, .. } => {
                // Hide window instead of closing
                window.hide().unwrap();
                api.prevent_close();
            }
            _ => {}
        })
        .setup(|app| {
            let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>).unwrap();
            let connect_i = MenuItem::with_id(app, "connect", "Connect", true, None::<&str>).unwrap();
            let disconnect_i = MenuItem::with_id(app, "disconnect", "Disconnect", true, None::<&str>).unwrap();
            let show_i = MenuItem::with_id(app, "show", "Show", true, None::<&str>).unwrap();
            
            let menu = Menu::with_items(app, &[&show_i, &connect_i, &disconnect_i, &quit_i]).unwrap();
            
            let _tray = TrayIconBuilder::new()
                .menu(&menu)
                .icon(app.default_window_icon().unwrap().clone())
                .on_menu_event(|app: &AppHandle, event| {
                    match event.id.as_ref() {
                        "quit" => {
                            app.exit(0);
                        }
                        "show" => {
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                        "connect" => {
                           let app_handle = app.clone();
                           tauri::async_runtime::spawn(async move {
                               let _ = app_handle.shell().command("warp-cli").args(["connect"]).output().await;
                           });
                        }
                        "disconnect" => {
                            let app_handle = app.clone();
                            tauri::async_runtime::spawn(async move {
                                let _ = app_handle.shell().command("warp-cli").args(["disconnect"]).output().await;
                            });
                        }
                        _ => {}
                    }
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click { .. } = event {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                })
                .build(app)?;
                
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![connect, disconnect, get_status, get_settings, set_mode])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
