import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RealtorListingsComponent } from './realtor-listings.component';

describe('RealtorListingsComponent', () => {
  let component: RealtorListingsComponent;
  let fixture: ComponentFixture<RealtorListingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RealtorListingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RealtorListingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
