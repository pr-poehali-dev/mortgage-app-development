import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Document {
  id: string;
  type: string;
  files: File[];
  uploadedAt: string;
}

interface Application {
  id: string;
  status: 'pending' | 'processing' | 'approved' | 'rejected';
  date: string;
  documents: Document[];
}

const Index = () => {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState(0);
  const [passportFiles, setPassportFiles] = useState<File[]>([]);
  const [snilsFiles, setSnilsFiles] = useState<File[]>([]);
  const [inn, setInn] = useState('');
  const [email, setEmail] = useState('');
  const [applications, setApplications] = useState<Application[]>([
    {
      id: '1',
      status: 'processing',
      date: '15.11.2024',
      documents: []
    }
  ]);

  const handleLogin = () => {
    if (phone.length >= 10) {
      setIsAuthenticated(true);
      toast({
        title: "Успешный вход",
        description: "Добро пожаловать в Polivanov Plus",
      });
    }
  };

  const handleFileUpload = (files: FileList | null, type: 'passport' | 'snils') => {
    if (!files) return;
    const filesArray = Array.from(files);
    
    if (type === 'passport') {
      setPassportFiles(filesArray);
      toast({
        title: "Фотографии паспорта загружены",
        description: `Загружено файлов: ${filesArray.length}`,
      });
    } else {
      setSnilsFiles(filesArray);
      toast({
        title: "Фотографии СНИЛС загружены",
        description: `Загружено файлов: ${filesArray.length}`,
      });
    }
  };

  const handleSubmit = () => {
    if (inn && email) {
      const newApplication: Application = {
        id: Date.now().toString(),
        status: 'pending',
        date: new Date().toLocaleDateString('ru-RU'),
        documents: [
          {
            id: '1',
            type: 'Паспорт',
            files: passportFiles,
            uploadedAt: new Date().toISOString()
          },
          {
            id: '2',
            type: 'СНИЛС',
            files: snilsFiles,
            uploadedAt: new Date().toISOString()
          }
        ]
      };
      
      setApplications([newApplication, ...applications]);
      setStep(0);
      setPassportFiles([]);
      setSnilsFiles([]);
      setInn('');
      setEmail('');
      
      toast({
        title: "Документы отправлены брокеру",
        description: "Ваша заявка принята в обработку",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'rejected': return 'bg-red-500';
      case 'processing': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Одобрено';
      case 'rejected': return 'Отклонено';
      case 'processing': return 'В обработке';
      default: return 'Ожидает';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 animate-scale-in">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="Building2" size={40} className="text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-primary mb-2">Polivanov Plus</h1>
            <p className="text-muted-foreground">Ипотечный брокер</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Номер телефона</label>
              <Input
                type="tel"
                placeholder="+7 (___) ___-__-__"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="text-lg"
              />
            </div>
            <Button 
              onClick={handleLogin}
              className="w-full bg-accent hover:bg-accent/90 text-primary font-semibold"
              size="lg"
            >
              Войти
            </Button>
          </div>

          <div className="mt-6 pt-6 border-t text-center text-sm text-muted-foreground">
            <Icon name="Shield" size={16} className="inline mr-1" />
            Защищённая передача документов
          </div>
        </Card>
      </div>
    );
  }

  if (step > 0) {
    return (
      <div className="min-h-screen bg-muted p-4">
        <div className="max-w-2xl mx-auto py-8">
          <Card className="p-6 mb-6 bg-primary text-white">
            <h2 className="text-2xl font-bold mb-2">Вас приветствует компания Polivanov Plus</h2>
            <p className="text-white/90">
              Наш ипотечный брокер сразу будет оформлять вашу заявку по ипотеке, как только получит документы.
            </p>
          </Card>

          <div className="mb-6">
            <Progress value={(step / 3) * 100} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Шаг {step} из 3
            </p>
          </div>

          {step === 1 && (
            <Card className="p-8 animate-fade-in">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="FileText" size={32} className="text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Загрузите фотографии паспорта</h3>
                <p className="text-muted-foreground">Все страницы с данными и пропиской</p>
              </div>

              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e.target.files, 'passport')}
                  className="hidden"
                  id="passport-upload"
                />
                <label htmlFor="passport-upload" className="cursor-pointer">
                  <Icon name="Upload" size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">Выберите файлы</p>
                  <p className="text-sm text-muted-foreground">или перетащите их сюда</p>
                </label>
              </div>

              {passportFiles.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Загружено файлов: {passportFiles.length}</p>
                  <div className="space-y-2">
                    {passportFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <Icon name="Check" size={16} className="text-green-500" />
                        <span>{file.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setStep(0)} className="flex-1">
                  Назад
                </Button>
                <Button 
                  onClick={() => setStep(2)} 
                  disabled={passportFiles.length === 0}
                  className="flex-1 bg-accent hover:bg-accent/90 text-primary"
                >
                  Готово
                </Button>
              </div>
            </Card>
          )}

          {step === 2 && (
            <Card className="p-8 animate-fade-in">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="CreditCard" size={32} className="text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Загрузите фото СНИЛС</h3>
                <p className="text-muted-foreground">Лицевая и обратная сторона</p>
              </div>

              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e.target.files, 'snils')}
                  className="hidden"
                  id="snils-upload"
                />
                <label htmlFor="snils-upload" className="cursor-pointer">
                  <Icon name="Upload" size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-2">Выберите файлы</p>
                  <p className="text-sm text-muted-foreground">или перетащите их сюда</p>
                </label>
              </div>

              {snilsFiles.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Загружено файлов: {snilsFiles.length}</p>
                  <div className="space-y-2">
                    {snilsFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <Icon name="Check" size={16} className="text-green-500" />
                        <span>{file.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Назад
                </Button>
                <Button 
                  onClick={() => setStep(3)} 
                  disabled={snilsFiles.length === 0}
                  className="flex-1 bg-accent hover:bg-accent/90 text-primary"
                >
                  Готово
                </Button>
              </div>
            </Card>
          )}

          {step === 3 && (
            <Card className="p-8 animate-fade-in">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="Info" size={32} className="text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Дополнительная информация</h3>
                <p className="text-muted-foreground">ИНН и электронная почта</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">ИНН</label>
                  <Input
                    type="text"
                    placeholder="Введите ваш ИНН"
                    value={inn}
                    onChange={(e) => setInn(e.target.value)}
                    maxLength={12}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Электронная почта</label>
                  <Input
                    type="email"
                    placeholder="example@mail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Назад
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  disabled={!inn || !email}
                  className="flex-1 bg-accent hover:bg-accent/90 text-primary"
                >
                  Отправить брокеру
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted">
      <header className="bg-primary text-white shadow-lg">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
              <Icon name="Building2" size={24} className="text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Polivanov Plus</h1>
              <p className="text-xs text-white/80">Ипотечный брокер</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-white hover:bg-white/10"
            onClick={() => setIsAuthenticated(false)}
          >
            <Icon name="LogOut" size={18} className="mr-2" />
            Выйти
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="new" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="new" className="flex items-center gap-2">
              <Icon name="Plus" size={16} />
              <span className="hidden sm:inline">Новая заявка</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Icon name="History" size={16} />
              <span className="hidden sm:inline">История</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <Icon name="FolderOpen" size={16} />
              <span className="hidden sm:inline">Архив</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Icon name="Bell" size={16} />
              <span className="hidden sm:inline">Уведомления</span>
            </TabsTrigger>
            <TabsTrigger value="support" className="flex items-center gap-2">
              <Icon name="MessageCircle" size={16} />
              <span className="hidden sm:inline">Поддержка</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="new" className="animate-fade-in">
            <Card className="p-8 text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icon name="FileUp" size={40} className="text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Новая заявка на ипотеку</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Загрузите необходимые документы, и наш брокер начнёт оформление вашей заявки
              </p>
              <Button 
                size="lg" 
                onClick={() => setStep(1)}
                className="bg-accent hover:bg-accent/90 text-primary font-semibold"
              >
                <Icon name="ArrowRight" size={20} className="mr-2" />
                Начать загрузку документов
              </Button>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="animate-fade-in">
            <div className="space-y-4">
              {applications.map((app) => (
                <Card key={app.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge className={`${getStatusColor(app.status)} text-white`}>
                          {getStatusText(app.status)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{app.date}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Заявка #{app.id}
                      </p>
                      {app.documents.length > 0 && (
                        <div className="mt-3 flex gap-2">
                          {app.documents.map((doc) => (
                            <Badge key={doc.id} variant="outline">
                              <Icon name="FileText" size={12} className="mr-1" />
                              {doc.type}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <Icon name="ChevronRight" size={20} className="text-muted-foreground" />
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="documents" className="animate-fade-in">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Icon name="FolderOpen" size={20} />
                Архив документов
              </h3>
              <div className="space-y-3">
                {applications.flatMap(app => app.documents).map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/70 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Icon name="FileText" size={20} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{doc.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {doc.files.length} файл(ов) • {new Date(doc.uploadedAt).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Icon name="Download" size={18} />
                    </Button>
                  </div>
                ))}
                {applications.flatMap(app => app.documents).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Icon name="FolderOpen" size={48} className="mx-auto mb-3 opacity-50" />
                    <p>Документы отсутствуют</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="animate-fade-in">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Icon name="Bell" size={20} />
                Центр уведомлений
              </h3>
              <div className="space-y-4">
                <div className="flex gap-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                  <Icon name="Info" size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">Заявка в обработке</p>
                    <p className="text-sm text-blue-700">Ваши документы получены и проверяются брокером</p>
                    <p className="text-xs text-blue-600 mt-1">2 часа назад</p>
                  </div>
                </div>
                <div className="flex gap-4 p-4 bg-muted rounded">
                  <Icon name="CheckCircle" size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Документы получены</p>
                    <p className="text-sm text-muted-foreground">Все документы успешно загружены</p>
                    <p className="text-xs text-muted-foreground mt-1">3 часа назад</p>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="support" className="animate-fade-in">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Icon name="MessageCircle" size={20} />
                Служба поддержки
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <Card className="p-4 border-2 hover:border-primary cursor-pointer transition-colors">
                    <Icon name="Phone" size={24} className="text-primary mb-2" />
                    <h4 className="font-semibold mb-1">Позвонить</h4>
                    <p className="text-sm text-muted-foreground">+7 (800) 555-35-35</p>
                  </Card>
                  <Card className="p-4 border-2 hover:border-primary cursor-pointer transition-colors">
                    <Icon name="Mail" size={24} className="text-primary mb-2" />
                    <h4 className="font-semibold mb-1">Email</h4>
                    <p className="text-sm text-muted-foreground">support@polivanov.ru</p>
                  </Card>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Ваше сообщение</label>
                  <Textarea 
                    placeholder="Опишите ваш вопрос или проблему..."
                    rows={5}
                  />
                </div>
                <Button className="w-full bg-accent hover:bg-accent/90 text-primary">
                  <Icon name="Send" size={18} className="mr-2" />
                  Отправить сообщение
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
