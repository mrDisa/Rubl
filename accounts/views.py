from django.shortcuts import redirect, render

from accounts.models import User

from django.views.decorators.http import require_POST

@require_POST
def reg(request):
    user = User()
    user.gmail = request.POST['gmail']
    user.username = request.POST['username']
    user.password = request.POST['password']
    user.save()
    
    return redirect('register')
    

def register(request):
    return render(request, 'main/accs/register.html')