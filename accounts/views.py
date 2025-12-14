from django.contrib.auth import authenticate, login
from django.shortcuts import redirect, render

from django.contrib.auth.hashers import make_password, check_password

from accounts.models import User

from django.views.decorators.http import require_POST, require_GET

from blog.views import main

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
        
        status = request.POST.get('auth_status')
        status = not status
        
        users_data = User.objects.all()
        for user_data in users_data:
            if username == user_data.username and check_password(password, user_data.password):
                login(request, user)
                return redirect(main)
        else:
            return redirect('login')
        
    return render(request, 'main/accs/login.html')

