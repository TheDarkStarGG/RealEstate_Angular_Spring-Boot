import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RealtorSalesComponent } from './realtor-sales.component';

describe('RealtorSalesComponent', () => {
  let component: RealtorSalesComponent;
  let fixture: ComponentFixture<RealtorSalesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RealtorSalesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RealtorSalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
