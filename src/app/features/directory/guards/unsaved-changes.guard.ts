import { CanDeactivateFn } from '@angular/router';

interface HasUnsavedChanges {
  canDeactivate(): boolean;
}

export const unsavedChangesGuard: CanDeactivateFn<HasUnsavedChanges> = (component) => {
  return component.canDeactivate();
};
