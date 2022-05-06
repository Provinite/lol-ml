import { show } from "@tensorflow/tfjs-vis";
import { createElement } from "react";
import ReactDOM from "react-dom";
import { MnistData } from "./number-recognition/MnistData";
import { getModel } from "./number-recognition/model";
import { showExamples } from "./number-recognition/visualization";
import { HandDrawnNumberApp } from "./HandDrawnNumberApp";

// document.addEventListener("DOMContentLoaded", run);
ReactDOM.render(
  createElement(HandDrawnNumberApp),
  document.getElementById("app")
);

async function run() {
  const data = new MnistData();
  await data.load();
  await showExamples(data);
  const model = getModel();
  show.modelSummary(
    {
      name: "Model Architecture",
      tab: "Model",
    },
    model
  );

  // await trainModel(model, data);
  // await showAccuracy(model, data);
  // await showConfusion(model, data);
}
