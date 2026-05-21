import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RealtorDashboardComponent } from './realtor-dashboard.component';

describe('RealtorDashboardComponent', () => {
  let component: RealtorDashboardComponent;
  let fixture: ComponentFixture<RealtorDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RealtorDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RealtorDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
