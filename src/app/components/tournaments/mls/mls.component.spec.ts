import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MlsComponent } from './mls.component';

describe('MlsComponent', () => {
  let component: MlsComponent;
  let fixture: ComponentFixture<MlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MlsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
