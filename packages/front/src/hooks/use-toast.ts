import * as React from "react";
import { useTranslation } from "react-i18next";

import type { ToastActionElement, ToastProps } from "@/components/ui/toast";
import { translateText } from "@/lib/i18n";

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000000;

type IToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const;

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

type IActionType = typeof actionTypes;

type IAction =
  | {
      type: IActionType["ADD_TOAST"];
      toast: IToasterToast;
    }
  | {
      type: IActionType["UPDATE_TOAST"];
      toast: Partial<IToasterToast>;
    }
  | {
      type: IActionType["DISMISS_TOAST"];
      toastId?: IToasterToast["id"];
    }
  | {
      type: IActionType["REMOVE_TOAST"];
      toastId?: IToasterToast["id"];
    };

interface IState {
  toasts: IToasterToast[];
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

export const reducer = (state: IState, action: IAction): IState => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t,
        ),
      };

    case "DISMISS_TOAST": {
      const { toastId } = action;

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id);
        });
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t,
        ),
      };
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
};

const listeners: Array<(state: IState) => void> = [];

let memoryState: IState = { toasts: [] };

function dispatch(action: IAction) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

type IToast = Omit<IToasterToast, "id">;

function toast({ ...props }: IToast) {
  const id = genId();

  const update = (props: IToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    });
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss();
      },
    },
  });

  return {
    id: id,
    dismiss,
    update,
  };
}

function useToast() {
  const { t } = useTranslation();
  const [state, setState] = React.useState<IState>(memoryState);
  const localizedToast = React.useCallback(
    (props: IToast) =>
      toast({
        ...props,
        description:
          typeof props.description === "string"
            ? translateText(t, props.description)
            : props.description,
        title:
          typeof props.title === "string"
            ? translateText(t, props.title)
            : props.title,
      }),
    [t],
  );

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    ...state,
    toast: localizedToast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  };
}

export { useToast, toast };
