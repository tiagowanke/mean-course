import { ThrowStmt } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Post } from '../post.model';
import { PostService } from '../post.service';

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
  private mode = 'create';
  private postId: string | null;

  constructor(public postService: PostService,
              public route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if(paramMap.has('postId')) {
        this.mode = 'edit';
        this.postId = paramMap.get('postId');
        this.isLoading = true;
        if(this.postId) {
          this.postService.getPost(this.postId).subscribe(postData => {
            this.isLoading = false;
            this.post = { id: postData._id, title: postData.title, content: postData.content };
          });
        }
      } else {
        this.mode = 'create';
        this.postId = null;
        this.post = {
          title: '',
          content: ''
        }
      }
    });
  }

  onSavePost(form: NgForm): void {
    if(form.invalid) {
      return;
    }
    this.isLoading = true;
    if(this.mode === 'create' || !this.postId) {
      this.postService.addPost(form.value.title, form.value.content);
    } else {
      this.postService.updatePost(this.postId, form.value.title, form.value.content);
    }

    form.resetForm();
  }
}
