import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogModule,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { Appointment } from '../../../core/models/appointment.model';
import { Listing } from '../../../core/models/listing.model';
import { AppointmentFormComponent } from '../appointment-form/appointment-form.component';

@Component({
  selector: 'app-schedule-appointment-dialog',
  template: `
    <h2 mat-dialog-title>Schedule Viewing</h2>
    <mat-dialog-content>
      <app-appointment-form
        [listingId]="data.listing.id"
        (formSubmitted)="onAppointmentCreated($event)"
        (formCancelled)="onCancel()"
      ></app-appointment-form>
    </mat-dialog-content>
  `,
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    AppointmentFormComponent,
  ],
})
export class ScheduleAppointmentDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ScheduleAppointmentDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { listing: Listing }
  ) {}

  onAppointmentCreated(appointment: Appointment): void {
    this.dialogRef.close(appointment);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
