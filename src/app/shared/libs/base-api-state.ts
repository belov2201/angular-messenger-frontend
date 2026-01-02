export interface BaseApiState {
  isLoading: boolean;
  isLoaded: boolean;
  isError: boolean;
  isPendingAction: boolean;
}

export const baseApiState: BaseApiState = {
  isLoading: false,
  isLoaded: false,
  isError: false,
  isPendingAction: false,
};
