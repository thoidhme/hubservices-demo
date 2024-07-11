import { I18nObjects } from "./types";

const defaultHtml = `<button id='clickMe'>Click me</button>`;
const defaultStylesheet = `#clickMe{border:thin solid #5C93CD;padding:5px 10px;background:#729FCF;color:white;border-radius:5px}
#clickMe:hover{background:#5C93CD;}`;
const defaultJavascript = `document.getElementById('clickMe').addEventListener('click', () => {
  alert('You clicked me!');
});`;
export const enObj: I18nObjects = {
  defaultData: {
    html: defaultHtml,
    stylesheet: defaultStylesheet,
    javascript: defaultJavascript,
    cssFiles: [],
    jsFiles: [],
  },
};
