from django.shortcuts import redirect, render

# Models
from .models import Post
from accounts.models import Profile

# USER AUTHENTICATION
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from django.contrib.auth import authenticate, login

# LOGIN
from django.contrib.auth import logout
from django.contrib.auth.decorators import login_required


def main(request):
    posts = Post.objects.all()
    
    return render(request, 'main/base.html', {'posts': posts})

def profile(request):
    profile = Profile.objects.get(user=request.user)
    
    return render(request, 'main/profile.html', {'profile': profile})

def edit_profile(request):
    return render(request, 'main/edit_profile.html')

def save_profile(request):
    if request.method == 'POST':
        profile, _ = Profile.objects.get_or_create(user=request.user)
        profile.name = request.POST['name']
        profile.avatar = request.FILES.get('avatar')
        profile.save()
    return redirect('profile')

@login_required
def user_logout(request):
    if request.method == 'POST':
        logout(request)
        return redirect('main')
    
def add_post(request):
    if request.method == 'POST':
        post = Post()
        post.title = request.POST['title']
        post.description = request.POST['description']
        post.author_user = request.user.username
        post.author_name = request.user.profile.name
        post.save()
        return redirect('main')
        
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


def development(request):
    return render(request, 'main/in_development.html')