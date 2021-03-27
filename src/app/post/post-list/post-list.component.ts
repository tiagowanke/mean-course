import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { Post } from '../post.model';
import { PostService } from '../post.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.scss']
})
export class PostListComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  isLoading = false;
  totalPosts = 10;
  postsPerPage = 2;
  currentPage = 1;
  pageSizeOptions = [1, 2, 5, 10];
  userIsAuthenticated = false;
  userId: string | null;
  private postsSub: Subscription;
  private authStatusSub: Subscription;

  constructor(private postService: PostService,
              private authService: AuthService) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.postService.getPosts(this.postsPerPage, this.currentPage);
    this.userId = this.authService.getUserId();
    this.postsSub = this.postService
    .getPostUpdateListener()
    .subscribe((postData: { posts: Post[], postCount: number }) => {
      this.posts = postData.posts
      this.totalPosts = postData.postCount;
      this.isLoading = false;
    });

    this.authStatusSub = this.authService.getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated
        this.userId = this.authService.getUserId();
      });
  }

  ngOnDestroy(): void {
    this.postsSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }

  onDelete(post: Post): void {
    if(post.id) {
      this.postService.deletePost(post.id).subscribe(_ => {
        this.postService.getPosts(this.postsPerPage, this.currentPage);
      });
    }
  }

  onChangedPage(event: PageEvent): void {
    this.isLoading = true;
    this.currentPage = event.pageIndex + 1;
    this.postsPerPage = event.pageSize;
    this.postService.getPosts(this.postsPerPage, this.currentPage);
  }
}
