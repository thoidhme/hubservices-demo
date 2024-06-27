import {
  UICompBuilder,
  NameConfig,
  NumberControl,
  Section,
  withDefault,
  withExposingConfigs,
  withMethodExposing,
  eventHandlerControl,
  styleControl,
  toJSONObjectArray,
  jsonControl,
  AutoHeightControl,
  EditorContext,
} from "lowcoder-sdk";
import { useResizeDetector } from "react-resize-detector";

import "./index.css";

import { i18nObjs, trans } from "./i18n/comps";

import { Form } from './vendors'
import { useState } from "react";


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
    name : "radius",
    label : trans("style.borderRadius"),
    radius : "radius",
  },
  {
    name : "borderWidth",
    label : trans("style.borderWidth"),
    borderWidth : "borderWidth",
  }
] as const;

interface Point {
  id: number,
  color?: string,
  description?: string,
  x: number,
  size?: number,
}

// const HillchartsCompBase = new UICompBuilder(childrenMap, (props: any) => {
let MainCompBase = (function () {

  const childrenMap = {
    styles: styleControl(CompStyles),
    autoHeight: withDefault(AutoHeightControl, "fixed"),
    data: jsonControl(toJSONObjectArray, i18nObjs.defaultData),
    onEvent: eventHandlerControl([
      {
        label: "onChange",
        value: "change",
        description: "Triggers when Chart data changes",
      },
    ] as const),
  };
  
  return new UICompBuilder(childrenMap, (props: {
    onEvent: any;
    styles: { backgroundColor: any; border: any; radius: any; borderWidth: any; margin: any; padding: any; textSize: any; };
    data: any[] | null | undefined;
    autoHeight: boolean;
  }) => {
  const handleDataChange = () => {
    props.onEvent("change");
  };

  const [dimensions, setDimensions] = useState({ width: 480, height: 1000 });
  const { width, height, ref: conRef } = useResizeDetector({onResize: () =>{
    const container = conRef.current;
    if(!container || !width || !height) return;

    if(props.autoHeight) {
      setDimensions({
        width,
        height: dimensions.height,
      })
      return;
    }

    setDimensions({
      width,
      height,
    })
  }});

  return (
    <div ref={conRef} style={{
      height: `100%`,
      width: `100%`,
      backgroundColor: `${props.styles.backgroundColor || 'white'}`,
      borderColor: `${props.styles.border || '#dddddd'}`,
      borderRadius: `${props.styles.radius}`,
      borderWidth: `${props.styles.borderWidth || 1}`,
      borderStyle: 'solid',
      margin: `${props.styles.margin}`,
      padding: `${props.styles.padding || '5px'}`,
      fontSize: `${props.styles.textSize}`,
      alignItems: 'center',
      justifyContent: 'center',
      display: 'center',
    }}>
      <Form/>
    </div>
  );
})
.setPropertyViewFn((children: any) => {
  return (
    <>
      <Section name="Basic">
        {children.data.propertyView({ label: "Data" })}
      </Section>
      <Section name="Interaction">
        {children.onEvent.propertyView()}
      </Section>
      <Section name="Styles">
        {children.autoHeight.getPropertyView()}
        {children.styles.getPropertyView()}
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
      params: [{
        name: "data",
        type: "JSON",
        description: "JSON value"
      }],
    },
    execute: (comp: any, values: any[]) => {
      const point = values[0] as Point;
      if(typeof point !== 'object') {
        return Promise.reject(trans("methods.invalidInput"))
      }
      if(!point.id) {
        return Promise.reject(trans("methods.requiredField", { field: 'ID' }));
      }
      if(!point.x) {
        return Promise.reject(trans("methods.requiredField", { field: 'X position' }));
      }
      const data = comp.children.data.getView(); 
      const newData = [
        ...data,
        point,
      ];
      comp.children.data.dispatchChangeValueAction(JSON.stringify(newData, null, 2));
    }
  },
]);

export default withExposingConfigs(MainCompBase, [
  new NameConfig("data", trans("component.data")),
]);
