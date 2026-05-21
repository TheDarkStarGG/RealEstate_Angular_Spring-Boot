import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminRealtorsComponent } from './admin-realtors.component';

describe('AdminRealtorsComponent', () => {
  let component: AdminRealtorsComponent;
  let fixture: ComponentFixture<AdminRealtorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdminRealtorsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminRealtorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
