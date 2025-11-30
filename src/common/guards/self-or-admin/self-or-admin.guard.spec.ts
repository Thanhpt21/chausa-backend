import { SelfOrAdminGuard } from './self-or-admin.guard';

describe('SelfOrAdminGuard', () => {
  it('should be defined', () => {
    expect(new SelfOrAdminGuard()).toBeDefined();
  });
});
