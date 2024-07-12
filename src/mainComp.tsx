import { debounce } from "lodash";
import {
  NameConfig,
  Section,
  UICompBuilder,
  withDefault,
  jsonControl,
  stringExposingStateControl,
  toJSONArray,
  getPromiseAfterDispatch,
  withExposingConfigs,
  StringControl,
  routeByNameAction,
  executeQueryAction,
  withMethodExposing,
} from "lowcoder-sdk";
import "./index.css";

import { i18nObjs, trans } from "./i18n/comps";

import { useEffect, useState } from "react";

// const HillchartsCompBase = new UICompBuilder(childrenMap, (props: any) => {
let MainCompBase = (function () {
  const childrenMap = {
    html: withDefault(StringControl, i18nObjs.defaultData.html),
    stylesheet: withDefault(StringControl, i18nObjs.defaultData.stylesheet),
    javascript: withDefault(StringControl, i18nObjs.defaultData.javascript),
    cssFiles: jsonControl(toJSONArray, i18nObjs.defaultData.cssFiles),
    jsFiles: jsonControl(toJSONArray, i18nObjs.defaultData.jsFiles),
  };

  return new UICompBuilder(
    childrenMap,
    (
      props: {
        html: any;
        stylesheet: any;
        javascript: any;
        cssFiles: string[];
        jsFiles: string[];
        autoHeight: boolean;
      },
      dispatch: any
    ) => {
      const debouncedScript = (content: any, type: string) => {
        const scripts: any[] = [];
        const existingScripts = document.querySelectorAll(
          `script[data-js="${type}"]`
        );
        existingScripts.forEach((oldScript) => {
          oldScript?.parentNode?.removeChild(oldScript);
          oldScript?.remove();
        });
        if (Array.isArray(content)) {
          content.forEach((file) => {
            const script = document.createElement("script");
            script.setAttribute("data-js", type);
            script.setAttribute("type", "text/javascript");
            script.setAttribute("src", file);
            script.setAttribute("async", "");
            document.body.appendChild(script);
            scripts.push(script);
          });
        } else {
          const script = document.createElement("script");
          script.text = content;
          script.setAttribute("data-js", type);
          document.body.appendChild(script);
          scripts.push(script);
        }

        return () => {
          scripts.forEach((script) => {
            script.remove();
            document.body.removeChild(script);
          });
        };
      };

      const debouncedStyle = (content: string[]) => {
        const styles: any[] = [];
        const existingStyles = document.querySelectorAll(
          `style[data-css="file"]`
        );
        existingStyles.forEach((oldStyle) => {
          oldStyle?.parentNode?.removeChild(oldStyle);
          oldStyle?.remove();
        });

        content.forEach((file) => {
          const style = document.createElement("link");
          style.setAttribute("data-css", "file");
          style.setAttribute("rel", "stylesheet");
          style.setAttribute("href", file);
          document.head.appendChild(style);
          styles.push(style);
        });

        return () => {
          styles.forEach((style) => {
            style.remove();
            document.head.removeChild(style);
          });
        };
      };

      useEffect(() => {
        window.queryData = (queryName: string) => {
          return getPromiseAfterDispatch(
            dispatch,
            routeByNameAction(queryName, executeQueryAction({}))
          );
        };
        return () => {
          window.queryData = async () => {};
        };
      }, []);

      useEffect(() => {
        const debounced = debounce(debouncedScript, 1000);
        debounced(props.javascript, "dynamic");
        return () => {
          debounced.cancel();
        };
      }, [props.javascript]);

      useEffect(() => {
        const debounced = debounce(debouncedScript, 1000);
        debounced(props.jsFiles, "file");
        return () => {
          debounced.cancel();
        };
      }, [props.jsFiles]);

      useEffect(() => {
        const debounced = debounce(debouncedStyle, 1000);
        debounced(props.cssFiles);
        return () => {
          debounced.cancel();
        };
      }, [props.cssFiles]);

      return (
        <>
          <style>{props.stylesheet}</style>
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
            dangerouslySetInnerHTML={{ __html: props.html }}
          />
        </>
      );
    }
  )
    .setPropertyViewFn((children: any) => {
      return (
        <>
          <Section name="Basic">
            {children.html.propertyView({ label: "Html content" })}
            {children.stylesheet.propertyView({ label: "Stylesheet" })}
            {children.javascript.propertyView({ label: "Javascript" })}
            {children.cssFiles.propertyView({ label: "Css files" })}
            {children.jsFiles.propertyView({ label: "Js files" })}
          </Section>
        </>
      );
    })
    .build();
})();

MainCompBase = withMethodExposing(MainCompBase, [
]);

export default withExposingConfigs(MainCompBase, [
  new NameConfig("html", trans("component.html")),
  new NameConfig("stylesheet", trans("component.stylesheet")),
  new NameConfig("javascript", trans("component.javascript")),
  new NameConfig("cssFiles", trans("component.cssFiles")),
  new NameConfig("jsFiles", trans("component.jsFiles")),
]);
