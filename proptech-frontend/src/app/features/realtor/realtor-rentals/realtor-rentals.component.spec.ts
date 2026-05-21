import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RealtorRentalsComponent } from './realtor-rentals.component';

describe('RealtorRentalsComponent', () => {
  let component: RealtorRentalsComponent;
  let fixture: ComponentFixture<RealtorRentalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RealtorRentalsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RealtorRentalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
