import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScoutListComponent } from './scout-list.component';

describe('ScoutListComponent', () => {
  let component: ScoutListComponent;
  let fixture: ComponentFixture<ScoutListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScoutListComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScoutListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
