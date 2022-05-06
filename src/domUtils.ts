export enum Button {
  None,
  Primary,
  Secondary,
  Auxiliary,
  Back,
  Forward,
}

const ButtonsFlags: Record<Button, number> = {
  [Button.None]: 0,
  [Button.Primary]: 1,
  [Button.Secondary]: 2,
  [Button.Auxiliary]: 4,
  [Button.Back]: 8,
  [Button.Forward]: 16,
};

const ClickButtons: Record<number, Button> = {
  0: Button.Primary,
  1: Button.Auxiliary,
  2: Button.Secondary,
  3: Button.Back,
  4: Button.Forward,
};

export const getPressedButtons = (buttons: number): Button[] => {
  if (buttons === 0) {
    return [];
  }
  const result: Button[] = [];
  for (const button of Object.values(Button)) {
    if (typeof button === "string" || button === Button.None) {
      continue;
    }

    if (ButtonsFlags[button] & buttons) {
      result.push(button);
    }
  }

  return result;
};

export const getMouseClickButton = (button: number): Button => {
  return ClickButtons[button];
};
