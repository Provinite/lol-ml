import {
  initializers,
  layers,
  Sequential,
  sequential,
  tidy,
  train,
} from "@tensorflow/tfjs";
import { show } from "@tensorflow/tfjs-vis";
import { MnistData } from "./MnistData";
import { IMAGE_SHAPE } from "../constants";

export function getModel() {
  const model = sequential();
  model.add(
    layers.conv2d({
      inputShape: [...IMAGE_SHAPE],
      kernelSize: 5,
      filters: 8,
      strides: 1,
      activation: "relu",
      kernelInitializer: initializers.varianceScaling({}),
    })
  );
  model.add(
    layers.maxPooling2d({
      poolSize: [2, 2],
      strides: [2, 2],
    })
  );

  model.add(
    layers.conv2d({
      inputShape: [...IMAGE_SHAPE],
      kernelSize: 5,
      filters: 16,
      strides: 1,
      activation: "relu",
      kernelInitializer: initializers.varianceScaling({}),
    })
  );
  model.add(
    layers.maxPooling2d({
      poolSize: [2, 2],
      strides: [2, 2],
    })
  );

  model.add(layers.flatten());
  model.add(
    layers.dense({
      units: 10,
      kernelInitializer: initializers.varianceScaling({}),
      activation: "softmax",
    })
  );

  const optimizer = train.adam();
  model.compile({
    optimizer,
    loss: "categoricalCrossentropy",
    metrics: ["accuracy"],
  });

  return model;
}

export async function trainModel(model: Sequential, data: MnistData) {
  const metrics = ["loss", "val_loss", "acc", "val_acc"];
  const container = {
    name: "Model Training",
    tab: "Model",
    styles: { height: "1000px" },
  };
  const fitCallbacks = show.fitCallbacks(container, metrics);

  const BATCH_SIZE = 512;
  const TRAIN_DATA_SIZE = 55000;
  const TEST_DATA_SIZE = 10000;

  const [trainXs, trainYs] = tidy(() => {
    const d = data.nextTrainBatch(TRAIN_DATA_SIZE);
    return [d.xs.reshape([TRAIN_DATA_SIZE, ...IMAGE_SHAPE]), d.labels];
  });

  const [testXs, testYs] = tidy(() => {
    const d = data.nextTestBatch(TEST_DATA_SIZE);
    return [d.xs.reshape([TEST_DATA_SIZE, ...IMAGE_SHAPE]), d.labels];
  });

  return model.fit(trainXs, trainYs, {
    batchSize: BATCH_SIZE,
    validationData: [testXs, testYs],
    epochs: 10,
    shuffle: true,
    callbacks: fitCallbacks,
  });
}
