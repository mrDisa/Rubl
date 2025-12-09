from pyexpat.errors import messages
from django.shortcuts import redirect, render

from django.contrib.auth.hashers import make_password, check_password

from accounts.models import User

from django.views.decorators.http import require_POST, require_GET

from blog.views import main

@require_POST
def reg(request):
    user = User()
    user.gmail = request.POST['gmail']
    user.username = request.POST['username']
    user.password = make_password(request.POST['password'])
    user.save()
    
    return redirect('register')

@require_POST
def log(request):
    user = User()
    user.username = request.POST.get('username')
    user.password = request.POST.get('password')
    users_data = User.objects.all()
    for user_data in users_data:
        if user.username == user_data.username and check_password(user.password, user_data.password):
            user.save()
            return redirect(main)
    else:
        return redirect('login')

def register(request):
    return render(request, 'main/accs/register.html')

def login(request):
    return render(request, 'main/accs/login.html')

