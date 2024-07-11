import { debounce } from "lodash";
import {
  AutoHeightControl,
  NameConfig,
  Section,
  UICompBuilder,
  jsonControl,
  stringExposingStateControl,
  styleControl,
  toJSONObject,
  toJSONObjectArray,
  toJSONArray,
  withDefault,
  getPromiseAfterDispatch,
  withExposingConfigs,
  CompAction,
  routeByNameAction,
  executeQueryAction,
  withMethodExposing,
} from "lowcoder-sdk";
import { useResizeDetector } from "react-resize-detector";
import "./index.css";

import { i18nObjs, trans } from "./i18n/comps";

import { useEffect, useState } from "react";

export const CompStyles = [
  {
    name: "margin",
    label: trans("style.margin"),
    margin: "margin",
  },
  {
    name: "padding",
    label: trans("style.padding"),
    padding: "padding",
  },
  {
    name: "textSize",
    label: trans("style.textSize"),
    textSize: "textSize",
  },
  {
    name: "backgroundColor",
    label: trans("style.backgroundColor"),
    backgroundColor: "backgroundColor",
  },
  {
    name: "border",
    label: trans("style.border"),
    border: "border",
  },
  {
    name: "radius",
    label: trans("style.borderRadius"),
    radius: "radius",
  },
  {
    name: "borderWidth",
    label: trans("style.borderWidth"),
    borderWidth: "borderWidth",
  },
] as const;

interface Point {
  id: number;
  color?: string;
  description?: string;
  x: number;
  size?: number;
}
const typeOptions = [
  {
    label: "Markdown",
    value: "markdown",
  },
  {
    label: trans("text"),
    value: "text",
  },
] as const;
// const HillchartsCompBase = new UICompBuilder(childrenMap, (props: any) => {
let MainCompBase = (function () {
  const childrenMap = {
    styles: styleControl(CompStyles),
    autoHeight: withDefault(AutoHeightControl, "fixed"),
    data: jsonControl(toJSONObject, i18nObjs.defaultData),
    html: stringExposingStateControl("text", i18nObjs.defaultData.html),
    stylesheet: stringExposingStateControl(
      "text",
      i18nObjs.defaultData.stylesheet
    ),
    javascript: stringExposingStateControl(
      "text",
      i18nObjs.defaultData.javascript
    ),
    cssFiles: jsonControl(toJSONArray, i18nObjs.defaultData.cssFiles),
    jsFiles: jsonControl(toJSONArray, i18nObjs.defaultData.jsFiles),
  };

  return new UICompBuilder(
    childrenMap,
    (
      props: {
        styles: {
          backgroundColor: any;
          border: any;
          radius: any;
          borderWidth: any;
          margin: any;
          padding: any;
          textSize: any;
        };
        html: any;
        stylesheet: any;
        javascript: any;
        cssFiles: string[];
        jsFiles: string[];
        autoHeight: boolean;
      },
      dispatch: any
    ) => {
      const [dimensions, setDimensions] = useState({
        width: 480,
        height: 1000,
      });
      const {
        width,
        height,
        ref: conRef,
      } = useResizeDetector({
        onResize: () => {
          const container = conRef.current;
          if (!container || !width || !height) return;

          if (props.autoHeight) {
            setDimensions({
              width,
              height: dimensions.height,
            });
            return;
          }

          setDimensions({
            width,
            height,
          });
        },
      });

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
        debounced(props.javascript.value, "dynamic");
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
          <style>{props.stylesheet.value}</style>
          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
            dangerouslySetInnerHTML={{ __html: props.html.value }}
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

MainCompBase = class extends MainCompBase {
  autoHeight(): boolean {
    return this.children.autoHeight.getView();
  }
};

MainCompBase = withMethodExposing(MainCompBase, [
  {
    method: {
      name: "setPoint",
      description: trans("methods.setPoint"),
      params: [
        {
          name: "data",
          type: "JSON",
          description: "JSON value",
        },
      ],
    },
    execute: (comp: any, values: any[]) => {
      const point = values[0] as Point;
      if (typeof point !== "object") {
        return Promise.reject(trans("methods.invalidInput"));
      }
      if (!point.id) {
        return Promise.reject(trans("methods.requiredField", { field: "ID" }));
      }
      if (!point.x) {
        return Promise.reject(
          trans("methods.requiredField", { field: "X position" })
        );
      }
      const data = comp.children.data.getView();
      const newData = [...data, point];
      comp.children.data.dispatchChangeValueAction(
        JSON.stringify(newData, null, 2)
      );
    },
  },
]);

export default withExposingConfigs(MainCompBase, [
  new NameConfig("data", trans("component.data")),
]);
