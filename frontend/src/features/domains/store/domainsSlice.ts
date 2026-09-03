import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "@/app/store";
import { domainsService } from "@/features/domains/services/domains.service";
import type {
  CreateDomainRequest,
  DomainRecord,
} from "@/features/domains/types/domains.types";

type DomainsState = {
  items: DomainRecord[];
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
};

const initialState: DomainsState = {
  items: [],
  isLoading: false,
  isMutating: false,
  error: null,
};

const errorMessage = (error: unknown, fallback: string) =>
  (error as { message?: string }).message ?? fallback;

export const fetchDomains = createAsyncThunk<
  DomainRecord[],
  void,
  { rejectValue: string }
>("domains/fetch", async (_, { rejectWithValue }) => {
  try {
    return (await domainsService.list()).data;
  } catch (error) {
    return rejectWithValue(errorMessage(error, "Unable to load domains."));
  }
});

export const createDomain = createAsyncThunk<
  DomainRecord,
  CreateDomainRequest,
  { rejectValue: string }
>("domains/create", async (request, { rejectWithValue }) => {
  try {
    return (await domainsService.create(request)).data;
  } catch (error) {
    return rejectWithValue(errorMessage(error, "Unable to add domain."));
  }
});

export const verifyDomain = createAsyncThunk<
  DomainRecord,
  string,
  { rejectValue: string }
>("domains/verify", async (id, { rejectWithValue }) => {
  try {
    return (await domainsService.verify(id)).data;
  } catch (error) {
    return rejectWithValue(errorMessage(error, "Unable to verify domain."));
  }
});

export const removeDomain = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("domains/remove", async (id, { rejectWithValue }) => {
  try {
    await domainsService.remove(id);
    return id;
  } catch (error) {
    return rejectWithValue(errorMessage(error, "Unable to remove domain."));
  }
});

const domainsSlice = createSlice({
  name: "domains",
  initialState,
  reducers: {
    clearDomainsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDomains.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDomains.fulfilled, (state, action) => {
        state.items = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchDomains.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Unable to load domains.";
      })
      .addCase(createDomain.pending, (state) => {
        state.isMutating = true;
        state.error = null;
      })
      .addCase(createDomain.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.isMutating = false;
      })
      .addCase(createDomain.rejected, (state, action) => {
        state.isMutating = false;
        state.error = action.payload ?? "Unable to add domain.";
      })
      .addCase(verifyDomain.pending, (state) => {
        state.isMutating = true;
      })
      .addCase(verifyDomain.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id,
        );
        if (index >= 0) state.items[index] = action.payload;
        state.isMutating = false;
      })
      .addCase(verifyDomain.rejected, (state, action) => {
        state.isMutating = false;
        state.error = action.payload ?? "Unable to verify domain.";
      })
      .addCase(removeDomain.pending, (state) => {
        state.isMutating = true;
      })
      .addCase(removeDomain.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
        state.isMutating = false;
      })
      .addCase(removeDomain.rejected, (state, action) => {
        state.isMutating = false;
        state.error = action.payload ?? "Unable to remove domain.";
      });
  },
});

export const { clearDomainsError } = domainsSlice.actions;
export const domainsReducer = domainsSlice.reducer;
export const selectDomains = (state: RootState) => state.domains.items;
export const selectDomainsLoading = (state: RootState) =>
  state.domains.isLoading;
export const selectDomainsMutating = (state: RootState) =>
  state.domains.isMutating;
export const selectDomainsError = (state: RootState) => state.domains.error;
