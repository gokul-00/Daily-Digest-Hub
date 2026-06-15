import { n as createBrowserClient } from "../_libs/@supabase/ssr+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/client-CWvg5vgi.js
function createSupabaseBrowserClient() {
	return createBrowserClient("https://nasbfeavyzoohzfdjqfs.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hc2JmZWF2eXpvb2h6ZmRqcWZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NTM1MDYsImV4cCI6MjA5NzAyOTUwNn0.mdI5zAgNNbOrPUTaY5BOsSqb6jxij-4QSy13AJv5a8k");
}
var browserClient;
function getSupabaseBrowserClient() {
	if (!browserClient) browserClient = createSupabaseBrowserClient();
	return browserClient;
}
//#endregion
export { getSupabaseBrowserClient as t };
