import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import "./styles/index.css";

// #region agent log — encoding debug
fetch('http://127.0.0.1:7244/ingest/318aca58-286a-4080-bc4f-6cd5c6cea3e0',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'main.tsx:init',message:'app boot',data:{testKorean:'한국사여행',charCode:('한').charCodeAt(0),navigatorLang:navigator.language,docCharset:document.characterSet},timestamp:Date.now(),hypothesisId:'A',runId:'encoding-1'})}).catch(()=>{});
// #endregion

createRoot(document.getElementById("root")!).render(<App />);
