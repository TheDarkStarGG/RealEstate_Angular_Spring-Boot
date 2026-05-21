import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RealtorAppointmentsComponent } from './realtor-appointments.component';

describe('RealtorAppointmentsComponent', () => {
  let component: RealtorAppointmentsComponent;
  let fixture: ComponentFixture<RealtorAppointmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RealtorAppointmentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RealtorAppointmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
