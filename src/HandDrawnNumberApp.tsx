import {
  Rank,
  Sequential,
  tensor,
  Tensor1D,
  tensor2d,
  tensor3d,
} from "@tensorflow/tfjs";
import { show } from "@tensorflow/tfjs-vis";
import * as React from "react";
import { FC, useCallback, useEffect, useState } from "react";
import { IMAGE_HEIGHT, IMAGE_SHAPE, IMAGE_WIDTH } from "./constants";
import { DrawGrid } from "./DrawGrid";
import { MnistData } from "./number-recognition/MnistData";
import { getModel, trainModel } from "./number-recognition/model";
import { showExamples } from "./number-recognition/visualization";
import useDebounce from "./useDebounce";

export const HandDrawnNumberApp: FC = () => {
  const [gridState, setGridState] = useState<boolean[]>([]);

  const [model, setModel] = useState(() => getModel());
  const [data, setData] = useState(() => new MnistData());
  const [trained, setTrained] = useState(false);

  const [prediction, setPrediction] = useState(0);
  const [confidence, setConfidence] = useState(0);

  const train = useCallback(async () => {
    if (trained) {
      return;
    }
    setTrained(true);
    await trainModel(model, data);
  }, [trained, setTrained, model]);

  const evaluate = useCallback(async () => {
    const tensor = tensor2d(
      gridState.map((gs) => (gs ? 1 : 0)),
      [IMAGE_WIDTH, IMAGE_HEIGHT]
    ).reshape([-1, ...IMAGE_SHAPE]);
    const result: Tensor1D = model.predict(tensor) as Tensor1D;
    const data = await result.data();
    const resultVal = data.findIndex((val) => val === Math.max(...data));

    setPrediction(resultVal);
    setConfidence(data[resultVal]);
  }, [gridState, model, setPrediction, setConfidence]);

  const debounceSetGs = useDebounce(gridState);

  useEffect(() => {
    evaluate();
  }, [debounceSetGs]);

  useEffect(() => {
    (async () => {
      await data.load();
      await showExamples(data);
      show.modelSummary(
        {
          name: "Model Architecture",
          tab: "Model",
        },
        model
      );
    })();
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <DrawGrid onGridStateChange={(gs) => setGridState(gs)} />
      <div>
        <h1>{prediction}</h1>
        <h2>{(confidence * 100).toFixed(2)}%</h2>
      </div>
      {trained || <button onClick={train}>Train</button>}
    </div>
  );
};
