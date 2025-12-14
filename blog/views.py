from django.shortcuts import render

from .models import Post


def main(request):
    posts = Post.objects.all()
    
    return render(request, 'main/base.html', {'posts': posts})
