import {
  browser,
  Rank,
  Sequential,
  Tensor,
  Tensor1D,
  Tensor2D,
  tidy,
} from "@tensorflow/tfjs";
import { metrics, render, show, visor } from "@tensorflow/tfjs-vis";
import { IMAGE_SHAPE } from "../constants";
import { MnistData } from "./MnistData";

const classNames = [
  "Zero",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
];

function doPrediction(model: Sequential, data: MnistData, testDataSize = 500) {
  const IMAGE_WIDTH = 28;
  const IMAGE_HEIGHT = 28;
  const testData = data.nextTestBatch(testDataSize);
  const testxs = testData.xs.reshape([
    testDataSize,
    IMAGE_WIDTH,
    IMAGE_HEIGHT,
    1,
  ]);
  const labels = testData.labels.argMax(-1);
  const preds = (model.predict(testxs) as Tensor<Rank>).argMax(-1);

  testxs.dispose();
  return [preds, labels];
}

export async function showAccuracy(model: Sequential, data: MnistData) {
  const [preds, labels] = doPrediction(model, data) as [Tensor1D, Tensor1D];
  const classAccuracy = await metrics.perClassAccuracy(labels, preds);
  const container = { name: "Accuracy", tab: "Evaluation" };
  show.perClassAccuracy(container, classAccuracy, classNames);

  labels.dispose();
}

export async function showConfusion(model: Sequential, data: MnistData) {
  const [preds, labels] = doPrediction(model, data) as [Tensor1D, Tensor1D];
  const confusionMatrix = await metrics.confusionMatrix(labels, preds);
  const container = { name: "Confusion Matrix", tab: "Evaluation" };
  render.confusionMatrix(container, {
    values: confusionMatrix,
    tickLabels: classNames,
  });

  labels.dispose();
}

export async function showExamples(data: MnistData) {
  const surface = visor().surface({
    name: "Input Data Examples",
    tab: "Input Data",
  });

  const examples = data.nextTestBatch(20);
  const numExamples = examples.xs.shape[0];

  for (let i = 0; i < numExamples; i++) {
    const imageTensor = tidy<Tensor2D>(() => {
      // Reshape the image to 28x28 px
      return examples.xs
        .slice([i, 0], [1, examples.xs.shape[1]])
        .reshape([...IMAGE_SHAPE]);
    });

    const canvas = document.createElement("canvas");
    canvas.width = 28;
    canvas.height = 28;
    canvas.setAttribute("style", "margin: 4px;");
    await browser.toPixels(imageTensor, canvas);
    surface.drawArea.appendChild(canvas);

    imageTensor.dispose();
  }
}
