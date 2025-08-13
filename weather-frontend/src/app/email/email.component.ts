import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DataService } from '../service/data.service';

@Component({
  selector: 'app-email',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './email.component.html',
  styleUrl: './email.component.css'
})
export class EmailComponent implements OnInit {

  constructor(private dataService: DataService) { }

  myForm!: FormGroup;
  cities: string[] = [
    'Delhi', 'Mumbai', 'Kolkata', 'Chennai', 'Bangalore',
    'Hyderabad', 'Ahmedabad', 'Pune', 'Jaipur', 'Lucknow',
    'Bhopal', 'Indore', 'Patna', 'Nagpur', 'Chandigarh'
  ];
  filteredCities: string[] = [...this.cities];

  citySearchControl = new FormControl(''); // standalone control for search

  ngOnInit(): void {
    this.myForm = new FormGroup({
      first: new FormControl('', [
        Validators.required,
        Validators.maxLength(25),
        Validators.pattern('^[a-zA-Z]+$')
      ]),
      last: new FormControl('', [
        Validators.maxLength(25),
        Validators.pattern('^[a-zA-Z]+$')
      ]),
      email: new FormControl('', [
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')
      ]),
      time: new FormControl('60000', Validators.required),
      city: new FormControl('', Validators.required)
    });

    this.citySearchControl.valueChanges.subscribe(search => {
      const query = search?.toLowerCase() || '';
      this.filteredCities = this.cities.filter(city =>
        city.toLowerCase().includes(query)
      );
    });
  }

  

  formSubmit() {
    if (this.myForm.valid) {
      this.dataService.sendData(this.myForm.value).subscribe({
        next: () => {this.myForm.reset();console.log(`Form submitted`);},
        error: err => console.error('Submission error:', err)
      });
    }
  }
}
