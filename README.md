# Rubl - Социальная сеть для разработчиков

### В стадии разработки...

### Что можно делать?
Можно регистрироваться и логиниться в аккаунт (`http://127.0.0.1:8000/register` и `http://127.0.0.1:8000/login` при запуске проекта)


### Установка 
1. Клонируйте репозиторий и создайте виртуальное окружение:
```bash
git clone https://github.com/mrDisa/Rubl.git
cd Rubl
```
```
python -m venv venv
venv\Scripts\activate
```
2. Установите зависимоcти:
```
pip install -r requirements.txt
cd rubl
```
3. Примените миграции и запустите проект:
```
python manage.py migrate
python manage.py runserver
```
