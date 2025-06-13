import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonacoViewer } from './monaco-viewer';

describe('MonacoViewer', () => {
  let component: MonacoViewer;
  let fixture: ComponentFixture<MonacoViewer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonacoViewer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonacoViewer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
