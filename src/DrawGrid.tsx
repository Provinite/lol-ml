import * as React from "react";
import { useEffect } from "react";
import { IMAGE_HEIGHT, IMAGE_WIDTH } from "./constants";
import { Button, getMouseClickButton, getPressedButtons } from "./domUtils";

export interface DrawGridProps {
  onGridStateChange: (state: boolean[]) => void;
}

export const DrawGrid: React.FunctionComponent<DrawGridProps> = ({
  onGridStateChange,
}) => {
  let [mouseDown, setMouseDown] = React.useState(false);
  let [markState, setMarkState] = React.useState(true);

  const [gs, mark, idx] = useGridState(IMAGE_HEIGHT, IMAGE_WIDTH);

  useEffect(() => {
    onGridStateChange(gs);
  }, [...gs]);
  const onMouseDown = React.useCallback(
    (e: React.MouseEvent) => {
      setMouseDown(true);
      setMarkState(getMouseClickButton(e.button) === Button.Primary);
    },
    [setMouseDown, setMarkState]
  );

  const onMouseUp = React.useCallback<React.MouseEventHandler<HTMLDivElement>>(
    (e) => {
      e.preventDefault();
      setMouseDown(false);
    },
    [setMouseDown, setMarkState]
  );

  const onMouseEnter = React.useCallback<
    React.MouseEventHandler<HTMLDivElement>
  >(
    ({ target, currentTarget, buttons }) => {
      if (target !== currentTarget) {
        return;
      }
      const pressedButtons = getPressedButtons(buttons);
      if (pressedButtons.length) {
        setMouseDown(true);
        setMarkState(pressedButtons.includes(Button.Primary));
      }
    },
    [setMouseDown, setMarkState]
  );

  const onMouseOut = React.useCallback<React.MouseEventHandler<HTMLDivElement>>(
    (e) => {
      if (e.target === e.currentTarget) {
        onMouseUp(e);
      }
    },
    [onMouseUp]
  );

  return (
    <div
      style={{
        userSelect: "none",
        display: "grid",
        gridTemplateRows: "repeat(28, 20px)",
        gridTemplateColumns: "repeat(28, 20px)",
        padding: "30px",
      }}
      onContextMenu={(e) => e.preventDefault()}
      onMouseDown={onMouseDown}
      onMouseUp={onMouseUp}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseOut}
    >
      {Array(IMAGE_HEIGHT)
        .fill(undefined)
        .map((_, rowIndex) => {
          return Array(IMAGE_WIDTH)
            .fill(undefined)
            .map((_, columnIndex) => (
              <div
                key={`${rowIndex},${columnIndex}`}
                onMouseDown={(e) => {
                  mark(
                    [true, true, false][e.button],
                    idx(rowIndex, columnIndex)
                  );
                }}
                onMouseOver={() => {
                  if (mouseDown) {
                    mark(markState, idx(rowIndex, columnIndex));
                  }
                }}
                style={{
                  userSelect: "none",
                  backgroundColor: gs[idx(rowIndex, columnIndex)]
                    ? "black"
                    : "white",
                  border: "1px solid black",
                }}
              >
                &nbsp;
              </div>
            ));
        })}
    </div>
  );
};

const useGridState = (
  width: number,
  height: number
): [
  cells: boolean[],
  setCell: (val: React.SetStateAction<boolean>, index: number) => void,
  getIndex: (row: number, col: number) => number
] => {
  // Capture these values once at first render.
  // dynamic resizing is not possible since we use
  // individual state buckets
  width = React.useMemo(() => width, []);
  height = React.useMemo(() => height, []);
  const len = React.useMemo(() => width * height, []);

  const cells: boolean[] = [];
  const setCellFns: React.Dispatch<React.SetStateAction<boolean>>[] = [];

  for (let i = 0; i < len; i++) {
    const [c, sc] = React.useState(false);
    cells[i] = c;
    setCellFns[i] = sc;
  }

  const getIndex = (row: number, col: number) => row * width + col;

  const setCell = (val: React.SetStateAction<boolean>, index: number) => {
    setCellFns[index](val);
  };

  return [cells, setCell, getIndex];
};
