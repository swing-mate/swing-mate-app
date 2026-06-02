import { storageService } from './storageService';

export const authService = {
  async dummyLogin(): Promise<void> {
    await storageService.setIsLoggedIn(true);
  },
  async logout(): Promise<void> {
    await storageService.logout();
  },
};
