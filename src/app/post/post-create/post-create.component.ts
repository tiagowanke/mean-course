import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Post } from '../post.model';
import { PostService } from '../post.service';
import { mimeType } from './mime-type.validator';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.scss']
})
export class PostCreateComponent implements OnInit {

  enteredTitle = '';
  enteredContent = '';
  post: Post;
  isLoading = false;
  form: FormGroup;
  imagePreview: string;
  private mode = 'create';
  private postId: string | null;

  constructor(public postService: PostService,
              public route: ActivatedRoute) {}

  ngOnInit(): void {

    this.form = new FormGroup({
      title: new FormControl(null, { validators: [ Validators.required, Validators.minLength(3) ] }),
      content: new FormControl(null, { validators: [ Validators.required ] }),
      image: new FormControl(null, {
        validators: [ Validators.required ],
        asyncValidators: [ mimeType ]
      })
    });

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if(paramMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paramMap.get('postId');
        this.isLoading = true;
        if(this.postId) {
          this.postService.getPost(this.postId).subscribe(postData => {
            this.isLoading = false;
            this.post = { id: postData._id, title: postData.title, content: postData.content, imagePath: postData.imagePath };
            this.form.setValue({ title: this.post.title, content: this.post.content, image: this.post.imagePath });
          });
        }
      } else {
        this.mode = 'create';
        this.postId = null;
        this.post = {
          title: '',
          content: '',
          imagePath: ''
        }
      }
    });
  }

  onSavePost(): void {
    if(this.form.invalid) {
      return;
    }
    this.isLoading = true;
    if(this.mode === 'create' || !this.postId) {
      this.postService.addPost(this.form.value.title, this.form.value.content, this.form.value.image);
    } else {
      this.postService.updatePost(this.postId, this.form.value.title, this.form.value.content, this.form.value.image);
    }

    this.form.reset();
  }

  onImagePicked(event: Event): void {
    const htmlInputEl = (event.target as HTMLInputElement)
    const file = htmlInputEl.files ? htmlInputEl.files[0] : null;

    if(file) {
      this.form.patchValue({ image: file });
      this.form.get('image')?.updateValueAndValidity();

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
}
