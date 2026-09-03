import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "@/app/store";
import { linksService } from "@/features/links/services/links.service";
import type {
  BulkHealthCheckResponse,
  CreateLinkRequest,
  LinkRecord,
  UpdateLinkRequest,
  BulkMilestoneRequest,
} from "@/features/links/types/links.types";

type LinksState = {
  items: LinkRecord[];
  total: number;
  limit: number;
  offset: number;
  isLoading: boolean;
  isMutating: boolean;
  lastCheckedAt: string | null;
  error: string | null;
};

const initialState: LinksState = {
  items: [],
  total: 0,
  limit: 20,
  offset: 0,
  isLoading: false,
  isMutating: false,
  lastCheckedAt: null,
  error: null,
};

const errorMessage = (error: unknown, fallback: string) =>
  (error as { message?: string }).message ?? fallback;

export const fetchLinks = createAsyncThunk<
  { items: LinkRecord[]; total: number; limit: number; offset: number },
  { limit?: number; offset?: number } | undefined,
  { rejectValue: string }
>("links/fetchLinks", async (params, { rejectWithValue }) => {
  try {
    const response = await linksService.list(params);
    return {
      items: response.data.urls,
      total: response.data.total,
      limit: response.data.limit,
      offset: response.data.offset,
    };
  } catch (error) {
    return rejectWithValue(errorMessage(error, "Unable to load links."));
  }
});

export const createLink = createAsyncThunk<
  LinkRecord,
  CreateLinkRequest,
  { rejectValue: string }
>("links/createLink", async (request, { dispatch, rejectWithValue }) => {
  try {
    const response = await linksService.create(request);
    dispatch(fetchLinks());
    return response.data;
  } catch (error) {
    return rejectWithValue(errorMessage(error, "Unable to create link."));
  }
});

export const deleteLink = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("links/deleteLink", async (shortCode, { dispatch, rejectWithValue }) => {
  try {
    await linksService.remove(shortCode);
    dispatch(fetchLinks());
    return shortCode;
  } catch (error) {
    return rejectWithValue(errorMessage(error, "Unable to delete link."));
  }
});

export const updateLink = createAsyncThunk<
  LinkRecord,
  { shortCode: string; request: UpdateLinkRequest },
  { rejectValue: string }
>(
  "links/updateLink",
  async ({ shortCode, request }, { dispatch, rejectWithValue }) => {
    try {
      const response = await linksService.update(shortCode, request);
      dispatch(fetchLinks());
      return response.data;
    } catch (error) {
      return rejectWithValue(errorMessage(error, "Unable to update link."));
    }
  },
);

export const checkLinkHealth = createAsyncThunk<
  {
    shortCode: string;
    healthStatus: LinkRecord["health_status"];
    checkedAt: string | null;
  },
  string,
  { rejectValue: string }
>("links/checkLinkHealth", async (shortCode, { rejectWithValue }) => {
  try {
    const response = await linksService.checkHealth(shortCode);
    return {
      shortCode: response.data.short_code,
      healthStatus: response.data.health_status,
      checkedAt: response.data.health_checked_at,
    };
  } catch (error) {
    return rejectWithValue(errorMessage(error, "Unable to check link health."));
  }
});

export const checkAllLinksHealth = createAsyncThunk<
  Awaited<BulkHealthCheckResponse>["data"],
  string[] | undefined,
  { rejectValue: string }
>("links/checkAllLinksHealth", async (shortCodes, { rejectWithValue }) => {
  try {
    const response = await linksService.checkAllHealth(shortCodes);
    return response.data;
  } catch (error) {
    return rejectWithValue(errorMessage(error, "Unable to check link health."));
  }
});

export const updateMilestones = createAsyncThunk<
  void,
  BulkMilestoneRequest,
  { rejectValue: string }
>("links/updateMilestones", async (request, { dispatch, rejectWithValue }) => {
  try {
    await linksService.updateMilestones(request);
    dispatch(fetchLinks());
    return;
  } catch (error) {
    return rejectWithValue(errorMessage(error, "Unable to save milestones."));
  }
});

export const lastCheckedAtSelector = (state: RootState) => {
  const latest = state.links.items.reduce((latest, link) => {
    if (link.health_checked_at) {
      const checkedAt = new Date(link.health_checked_at);
      return checkedAt > latest ? checkedAt : latest;
    }
    return latest;
  }, new Date(0));
  if (latest.getTime() === 0) return null;

  const pad = (value: number) => String(value).padStart(2, "0");
  return `${latest.getUTCFullYear()}-${pad(latest.getUTCMonth() + 1)}-${pad(
    latest.getUTCDate(),
  )} ${pad(latest.getUTCHours())}:${pad(latest.getUTCMinutes())}:${pad(
    latest.getUTCSeconds(),
  )}`;
};

const linksSlice = createSlice({
  name: "links",
  initialState,
  reducers: {
    clearLinksError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLinks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLinks.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.limit = action.payload.limit;
        state.offset = action.payload.offset;
        state.isLoading = false;
      })
      .addCase(fetchLinks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? "Unable to load links.";
      })
      .addCase(createLink.pending, (state) => {
        state.isMutating = true;
        state.error = null;
      })
      .addCase(createLink.fulfilled, (state) => {
        state.isMutating = false;
      })
      .addCase(createLink.rejected, (state, action) => {
        state.isMutating = false;
        state.error = action.payload ?? "Unable to create link.";
      })
      .addCase(deleteLink.pending, (state) => {
        state.isMutating = true;
        state.error = null;
      })
      .addCase(deleteLink.fulfilled, (state) => {
        state.isMutating = false;
      })
      .addCase(deleteLink.rejected, (state, action) => {
        state.isMutating = false;
        state.error = action.payload ?? "Unable to delete link.";
      })
      .addCase(updateLink.pending, (state) => {
        state.isMutating = true;
        state.error = null;
      })
      .addCase(updateLink.fulfilled, (state) => {
        state.isMutating = false;
      })
      .addCase(updateLink.rejected, (state, action) => {
        state.isMutating = false;
        state.error = action.payload ?? "Unable to update link.";
      })
      .addCase(checkLinkHealth.pending, (state) => {
        state.isMutating = true;
        state.error = null;
      })
      .addCase(checkLinkHealth.fulfilled, (state, action) => {
        const link = state.items.find(
          (item) => item.short_code === action.payload.shortCode,
        );

        if (link) {
          link.health_status = action.payload.healthStatus;
          link.health_checked_at = action.payload.checkedAt;
        }
        state.isMutating = false;
      })
      .addCase(checkLinkHealth.rejected, (state, action) => {
        state.isMutating = false;
        state.error = action.payload ?? "Unable to check link health.";
      })
      .addCase(checkAllLinksHealth.pending, (state) => {
        state.isMutating = true;
        state.error = null;
      })
      .addCase(checkAllLinksHealth.fulfilled, (state, action) => {
        for (const result of action.payload) {
          const link = state.items.find(
            (item) => item.short_code === result.short_code,
          );
          if (link) {
            link.health_status = result.health_status;
            link.health_checked_at = result.health_checked_at;
          }
        }
        state.lastCheckedAt = action.payload.reduce<string | null>(
          (latest, result) => {
            if (!result.health_checked_at) return latest;
            if (!latest) return result.health_checked_at;
            return new Date(result.health_checked_at) > new Date(latest)
              ? result.health_checked_at
              : latest;
          },
          null,
        );
        state.isMutating = false;
      })
      .addCase(checkAllLinksHealth.rejected, (state, action) => {
        state.isMutating = false;
        state.error = action.payload ?? "Unable to check link health.";
      })
      .addCase(updateMilestones.pending, (state) => {
        state.isMutating = true;
        state.error = null;
      })
      .addCase(updateMilestones.fulfilled, (state) => {
        state.isMutating = false;
      })
      .addCase(updateMilestones.rejected, (state, action) => {
        state.isMutating = false;
        state.error = action.payload ?? "Unable to save milestones.";
      });
  },
});

export const { clearLinksError } = linksSlice.actions;
export const linksReducer = linksSlice.reducer;

export const selectLinks = (state: RootState) => state.links.items;
export const selectLinksTotal = (state: RootState) => state.links.total;
export const selectLinksLoading = (state: RootState) => state.links.isLoading;
export const selectLinksMutating = (state: RootState) => state.links.isMutating;
export const selectLinksError = (state: RootState) => state.links.error;
