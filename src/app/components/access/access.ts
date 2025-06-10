import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-access',
  standalone: true, // <- this is important if you're using Angular standalone components
  templateUrl: './access.html',
  styleUrls: ['./access.css'], // <- 'styleUrls' not 'styleUrl'
  imports: [] // if needed, you can add CommonModule or others here
})
export class Access {

  
}
