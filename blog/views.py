from django.contrib.auth import authenticate, login
from django.shortcuts import redirect, render

from .models import Post
from accounts.models import Profile

from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password

def main(request):
    posts = Post.objects.all()
    
    return render(request, 'main/base.html', {'posts': posts})

def profile(request):
    return render(request, 'main/profile.html')

def edit_profile(request):
    return render(request, 'main/edit_profile.html')

def save_profile(request):
    if request.method == 'POST':
        profile.name = request.POST['name']
        profile.avatar = request.POST['avatar']
        profile.save()
    return redirect('profile')
    
def add_post(request):
    if request.method == 'POST':
        post = Post()
        post.name = request.POST['name']
        post.description = request.POST['description']
        post.author_user = request.user.username
        post.save()
        
    return render(request, 'main/add_post.html')

    
def register(request):
    if request.method == 'POST':
        user = User()
        user.gmail = request.POST['gmail']
        user.username = request.POST['username']
        user.password = make_password(request.POST['password'])
        user.save()
        
        return redirect('register')
    
    return render(request, 'main/accs/register.html')

def user_login(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
                login(request, user)
                return redirect(main)
        else:
            return redirect('login')
        
    return render(request, 'main/accs/login.html')