import { TestBed } from '@angular/core/testing';

import { ViewerLink } from './viewer-link';

describe('ViewerLink', () => {
  let service: ViewerLink;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ViewerLink);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
