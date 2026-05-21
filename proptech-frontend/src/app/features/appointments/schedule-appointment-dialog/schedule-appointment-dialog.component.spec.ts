import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleAppointmentDialogComponent } from './schedule-appointment-dialog.component';

describe('ScheduleAppointmentDialogComponent', () => {
  let component: ScheduleAppointmentDialogComponent;
  let fixture: ComponentFixture<ScheduleAppointmentDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScheduleAppointmentDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScheduleAppointmentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
