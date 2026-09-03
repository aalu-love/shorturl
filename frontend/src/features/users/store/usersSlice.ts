import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "@/app/store";
import { usersService } from "@/features/users/services/users.service";
import type {
  UserListQuery,
  UserRecord,
  UserRequest,
} from "@/features/users/types/users.types";

type UsersState = {
  items: UserRecord[];
  isLoading: boolean;
  isMutating: boolean;
  error: string | null;
};
const initialState: UsersState = {
  items: [],
  isLoading: false,
  isMutating: false,
  error: null,
};
const message = (error: unknown, fallback: string) =>
  (error as { message?: string }).message ?? fallback;

export const fetchUsers = createAsyncThunk<
  UserRecord[],
  UserListQuery | undefined,
  { rejectValue: string }
>("users/fetch", async (query, { rejectWithValue }) => {
  try {
    return (await usersService.list(query)).data.users;
  } catch (error) {
    return rejectWithValue(message(error, "Unable to load users."));
  }
});
export const inviteUser = createAsyncThunk<
  UserRecord,
  UserRequest,
  { rejectValue: string }
>("users/invite", async (request, { dispatch, rejectWithValue }) => {
  try {
    const user = (await usersService.invite(request)).data;
    dispatch(fetchUsers());
    return user;
  } catch (error) {
    return rejectWithValue(message(error, "Unable to invite user."));
  }
});
export const updateUser = createAsyncThunk<
  UserRecord,
  { id: string; request: Partial<UserRequest> },
  { rejectValue: string }
>("users/update", async ({ id, request }, { dispatch, rejectWithValue }) => {
  try {
    const user = (await usersService.update(id, request)).data;
    dispatch(fetchUsers());
    return user;
  } catch (error) {
    return rejectWithValue(message(error, "Unable to update user."));
  }
});
export const removeUser = createAsyncThunk<
  string,
  string,
  { rejectValue: string }
>("users/remove", async (id, { dispatch, rejectWithValue }) => {
  try {
    await usersService.remove(id);
    dispatch(fetchUsers());
    return id;
  } catch (error) {
    return rejectWithValue(message(error, "Unable to remove user."));
  }
});

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearUsersError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchUsers.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchUsers.fulfilled, (state, action) => {
      state.items = action.payload;
      state.isLoading = false;
    });
    builder.addCase(fetchUsers.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload ?? "Unable to load users.";
    });
    builder.addCase(inviteUser.pending, (state) => {
      state.isMutating = true;
    });
    builder.addCase(inviteUser.fulfilled, (state) => {
      state.isMutating = false;
    });
    builder.addCase(inviteUser.rejected, (state, action) => {
      state.isMutating = false;
      state.error = action.payload ?? "Unable to invite user.";
    });
    builder.addCase(updateUser.pending, (state) => {
      state.isMutating = true;
    });
    builder.addCase(updateUser.fulfilled, (state) => {
      state.isMutating = false;
    });
    builder.addCase(updateUser.rejected, (state, action) => {
      state.isMutating = false;
      state.error = action.payload ?? "Unable to update user.";
    });
    builder.addCase(removeUser.pending, (state) => {
      state.isMutating = true;
    });
    builder.addCase(removeUser.fulfilled, (state) => {
      state.isMutating = false;
    });
    builder.addCase(removeUser.rejected, (state, action) => {
      state.isMutating = false;
      state.error = action.payload ?? "Unable to remove user.";
    });
  },
});
export const { clearUsersError } = usersSlice.actions;
export const usersReducer = usersSlice.reducer;
export const selectUsers = (state: RootState) => state.users.items;
export const selectUsersLoading = (state: RootState) => state.users.isLoading;
export const selectUsersMutating = (state: RootState) => state.users.isMutating;
export const selectUsersError = (state: RootState) => state.users.error;
