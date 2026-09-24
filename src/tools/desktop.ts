import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Ejecuta comandos de macOS para automatización del sistema y recopilación de información
 */
export async function executeTool(name: string, args: any): Promise<any> {
  console.log(`🔧 Ejecutando herramienta local [${name}] con parámetros:`, args);

  switch (name) {
    case 'open_app':
      return await openApp(args.appName);
    case 'get_system_info':
      return await getSystemInfo();
    case 'set_system_volume':
      return await setSystemVolume(args.level);
    case 'run_command':
      return await runTerminalCommand(args.command);
    case 'control_chrome':
      return await controlChrome(args.action, args.url, args.query);
    default:
      throw new Error(`Herramienta no implementada: ${name}`);
  }
}

/**
 * Abre una aplicación en macOS
 */
async function openApp(appName: string): Promise<string> {
  // Limpiar caracteres extraños del nombre de la app por seguridad
  const sanitizedAppName = appName.replace(/[^a-zA-Z0-9\s.-]/g, '');
  try {
    await execAsync(`open -a "${sanitizedAppName}"`);
    return `Aplicación '${sanitizedAppName}' abierta con éxito.`;
  } catch (error: any) {
    // Si falla, intentamos abrirla directamente (puede ser un path o app específica)
    try {
      await execAsync(`open -a "${sanitizedAppName}.app"`);
      return `Aplicación '${sanitizedAppName}' abierta con éxito.`;
    } catch (err2) {
      return `No se pudo abrir la aplicación '${sanitizedAppName}'. Error: ${error.message}`;
    }
  }
}

/**
 * Obtiene información de estado del Mac
 */
async function getSystemInfo(): Promise<any> {
  const info: any = {};

  // 1. Obtener Volumen
  try {
    const { stdout: volOut } = await execAsync(`osascript -e "output volume of (get volume settings)"`);
    info.volume = `${volOut.trim()}%`;
  } catch (e) {
    info.volume = 'Desconocido';
  }

  // 2. Obtener Batería
  try {
    const { stdout: battOut } = await execAsync('pmset -g batt');
    const lines = battOut.split('\n');
    if (lines.length > 1) {
      info.battery = lines[1].trim();
    } else {
      info.battery = lines[0].trim();
    }
  } catch (e) {
    info.battery = 'Desconocido o no disponible (PC de escritorio)';
  }

  // 3. Obtener Almacenamiento Libre en el disco principal
  try {
    const { stdout: dfOut } = await execAsync('df -h /');
    const lines = dfOut.trim().split('\n');
    if (lines.length > 1) {
      const parts = lines[1].split(/\s+/);
      info.disk = {
        total: parts[1],
        usado: parts[2],
        disponible: parts[3],
        porcentaje_uso: parts[4]
      };
    }
  } catch (e) {
    info.disk = 'Desconocido';
  }

  // 4. Obtener brillo de pantalla (macOS AppleScript)
  try {
    const { stdout: brightnessOut } = await execAsync(
      `osascript -e 'tell application "System Events" to get value of attribute "AXValue" of value indicator 1 of scroll area 1 of group 1 of window "Pantallas" of application process "System Settings"'`
    );
    info.brightness = brightnessOut.trim();
  } catch (e) {
    info.brightness = 'No disponible desde terminal básica';
  }

  return info;
}

/**
 * Ajusta el volumen del sistema
 */
async function setSystemVolume(level: number): Promise<string> {
  const sanitizedLevel = Math.min(Math.max(0, level), 100);
  try {
    await execAsync(`osascript -e "set volume output volume ${sanitizedLevel}"`);
    return `Volumen del sistema ajustado al ${sanitizedLevel}%.`;
  } catch (error: any) {
    return `Error al cambiar el volumen: ${error.message}`;
  }
}

/**
 * Ejecuta comandos generales en la terminal de forma local
 */
async function runTerminalCommand(command: string): Promise<string> {
  // Lista negra básica de comandos muy peligrosos por prevención
  const dangerousCommands = ['rm -rf /', 'sudo rm', 'mkfs', 'dd if='];
  if (dangerousCommands.some(danger => command.includes(danger))) {
    return 'Error: Comando bloqueado por motivos de seguridad extrema (intento de comando destructivo).';
  }

  try {
    // Ejecutar el comando con un tiempo límite de 10 segundos
    const { stdout, stderr } = await execAsync(command, { timeout: 10000 });
    const output = stdout.trim() || stderr.trim();
    return output || 'Comando ejecutado con éxito, sin salida en consola.';
  } catch (error: any) {
    return `Error al ejecutar el comando: ${error.message}\nSalida: ${error.stderr || ''}`;
  }
}

/**
 * Controla Google Chrome en macOS usando AppleScript
 */
async function controlChrome(action: string, url?: string, query?: string): Promise<any> {
  try {
    if (action === 'get_active_tab') {
      const script = `
        tell application "Google Chrome"
          if (count of windows) is 0 then
            return "No hay ventanas abiertas de Google Chrome"
          end if
          tell window 1
            set activeTab to active tab
            return (title of activeTab) & " - " & (URL of activeTab)
          end tell
        end tell
      `;
      const { stdout } = await execAsync(`osascript -e '${script}'`);
      return stdout.trim();
    } else if (action === 'open_url') {
      if (!url) return 'Error: Falta el parámetro "url".';
      
      const script = `
        tell application "Google Chrome"
          if (count of windows) is 0 then
            make new window
          end if
          tell window 1
            make new tab with properties {URL:"${url}"}
          end tell
          activate
        end tell
      `;
      await execAsync(`osascript -e '${script}'`);
      return `URL '${url}' abierta en una nueva pestaña de Chrome.`;
    } else if (action === 'search') {
      if (!query) return 'Error: Falta el parámetro "query".';
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      const script = `
        tell application "Google Chrome"
          if (count of windows) is 0 then
            make new window
          end if
          tell window 1
            make new tab with properties {URL:"${searchUrl}"}
          end tell
          activate
        end tell
      `;
      await execAsync(`osascript -e '${script}'`);
      return `Búsqueda en Google realizada para: "${query}".`;
    } else {
      return `Acción de Chrome no soportada: ${action}`;
    }
  } catch (error: any) {
    return `Error al controlar Google Chrome: ${error.message}. Asegúrate de que Chrome esté abierto o instalado.`;
  }
}
