import { Component, OnInit, ViewChild } from '@angular/core';
import { DishService } from '../services/dish.service';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Dish } from '../shared/dish';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Comment} from '../shared/comment';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss']
})

export class DishdetailComponent implements OnInit {

  dish: Dish;
  dishIds: string[];
  prev: string;
  next: string;
  commentForm: FormGroup;
  commentDish: Comment;
  @ViewChild('fform') commentFormDirective;

  formErrors = {
    'author': '',
    'comment': ''
  };

  validationMessages = {
    'author': {
      'required': 'Author name in required.',
      'minlength': 'Author name must be at least 2 characters long.'
    },
    'comment': {
      'required': 'Comment in required.',
      'minlength': 'Comment must be at least 2 characters long.'
    },
  };

  constructor(private dishService: DishService,
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder) {
      this.createForm(); }
     

  ngOnInit() {
  this.dishService.getDishIds()
    .subscribe((dishIds) => this.dishIds = dishIds);
  this.route.params
    .pipe(switchMap((params: Params)=> this.dishService.getDish(params['id'])))
    .subscribe(dish => { this.dish = dish; this.setPrevNext(dish.id); });
  }

  setPrevNext(dishIds: string) {
    const index = this.dishIds.indexOf(dishIds);
    this.prev = this.dishIds [(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds [(this.dishIds.length + index + 1) % this.dishIds.length];
  }

  goBack(): void {
    this.location.back();
  }

  createForm() {
    this.commentForm = this.fb.group({
      comment: ['', [Validators.required, Validators.minLength(2)]],
      rating: [0 + " Stars"],
      author: ['', [Validators.required, Validators.minLength(2)]],
      date: [Date.now()]
    });

    this.commentForm.valueChanges
    .subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); // (re)set form validation messages
  }

  onValueChanged(data?: any) {
    if (!this.commentForm) { return; }
    const form = this.commentForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }

  onSubmit() {
    this.commentDish = this.commentForm.value;
    console.log(this.commentDish);
    const comm = this.commentDish;
    const date = Date.now();
    this.dish.comments.push(comm);
    this.commentForm.patchValue({
      author: '',
      rating: 5,
      comment: ''
    })
    this.commentFormDirective.patchValueForm();
    }
}
