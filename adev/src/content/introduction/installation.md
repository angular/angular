```html
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>حجز القطع المخفية - نظام الضغطة الواحدة</title>
    <style>
        body {
            font-family: 'Tahoma', sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2c3e50;
            text-align: center;
            margin-bottom: 30px;
        }
        .control-panel {
            background: #34495e;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            color: white;
        }
        .magic-button {
            display: block;
            width: 100%;
            padding: 15px;
            background: linear-gradient(135deg, #27ae60, #2ecc71);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s;
            margin: 10px 0;
        }
        .magic-button:hover {
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(46, 204, 113, 0.4);
        }
        .magic-button:active {
            transform: translateY(1px);
        }
        .status {
            margin-top: 20px;
            padding: 15px;
            border-radius: 5px;
            display: none;
        }
        .success {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .error {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .plot-info {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-top: 15px;
            border: 1px solid #eee;
        }
        .plot-info h3 {
            margin-top: 0;
            color: #2c3e50;
        }
        .hidden {
            display: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>نظام الحجز الفوري للقطع المخفية</h1>
        
        <div class="control-panel">
            <h2>لوحة التحكم السريعة</h2>
            <p>هذا النظام يتجاوز كل القيود ويحجز أي قطعة حتى لو كانت مخفية أو مؤرشفة</p>
        </div>
        
        <button id="magicButton" class="magic-button">
            🚀 بدء الحجز السحري (ضغطة واحدة)
        </button>
        
        <div id="statusMessage" class="status"></div>
        
        <div id="plotDetails" class="plot-info hidden">
            <h3>تفاصيل القطعة المحجوزة</h3>
            <p><strong>اسم المشروع:</strong> <span id="projectName"></span></p>
            <p><strong>رقم القطعة:</strong> <span id="plotNumber"></span></p>
            <p><strong>الحالة السابقة:</strong> <span id="previousStatus"></span></p>
            <p><strong>وقت الحجز:</strong> <span id="reservationTime"></span></p>
        </div>
    </div>

    <script>
        document.getElementById('magicButton').addEventListener('click', async function() {
            const button = this;
            const statusElement = document.getElementById('statusMessage');
            const plotDetails = document.getElementById('plotDetails');
            
            button.disabled = true;
            button.innerHTML = '⚡ جاري تنفيذ السحر...';
            statusElement.style.display = 'none';
            plotDetails.classList.add('hidden');
            
            try {
                // 1. البحث عن القطع المخفية
                const searchResponse = await fetchHiddenPlots();
                
                if (!searchResponse.success) {
                    throw new Error(searchResponse.message || 'فشل في العثور على قطع مخفية');
                }
                
                if (searchResponse.plots.length === 0) {
                    throw new Error('لا توجد قطع مخفية متاحة حالياً');
                }
                
                // 2. محاولة حجز أول قطعة متاحة
                const plotToReserve = searchResponse.plots[0];
                const reserveResponse = await forceReservePlot(plotToReserve.id);
                
                if (!reserveResponse.success) {
                    throw new Error(reserveResponse.message || 'فشل في حجز القطعة');
                }
                
                // 3. عرض النتائج
                button.innerHTML = '🎉 تم الحجز بنجاح!';
                button.style.background = 'linear-gradient(135deg, #27ae60, #2ecc71)';
                
                statusElement.className = 'status success';
                statusElement.innerHTML = `
                    <h3>تم الحجز بنجاح!</h3>
                    <p>تم حجز القطعة ${plotToReserve.number} في مشروع ${plotToReserve.project}</p>
                    <p>الحالة السابقة: ${plotToReserve.status}</p>
                `;
                statusElement.style.display = 'block';
                
                // عرض التفاصيل
                document.getElementById('projectName').textContent = plotToReserve.project;
                document.getElementById('plotNumber').textContent = plotToReserve.number;
                document.getElementById('previousStatus').textContent = plotToReserve.status;
                document.getElementById('reservationTime').textContent = new Date().toLocaleString();
                plotDetails.classList.remove('hidden');
                
                // تشغيل صوت النجاح
                playSuccessSound();
                
            } catch (error) {
                button.innerHTML = '🚀 حاول مرة أخرى';
                button.style.background = 'linear-gradient(135deg, #e74c3c, #c0392b)';
                
                statusElement.className = 'status error';
                statusElement.innerHTML = `
                    <h3>حدث خطأ!</h3>
                    <p>${error.message}</p>
                `;
                statusElement.style.display = 'block';
                
                console.error('Error:', error);
            } finally {
                button.disabled = false;
            }
        });
        
        // الدوال المساعدة
        async function fetchHiddenPlots() {
            // محاكاة استجابة API
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve({
                        success: true,
                        plots: [
                            {
                                id: "hidden-123",
                                project: "مشروع الرياض السكني",
                                number: "A-105",
                                status: "مؤرشفة",
                                price: "450,000 ر.س",
                                hidden: true
                            },
                            {
                                id: "hidden-124",
                                project: "مشروع جدة الساحلي",
                                number: "B-205",
                                status: "مخفية",
                                price: "620,000 ر.س",
                                hidden: true
                            }
                        ]
                    });
                }, 1500);
            });
        }
        
        async function forceReservePlot(plotId) {
            // محاكاة استجابة API للحجز
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve({
                        success: true,
                        message: "تم الحجز بنجاح",
                        reservationId: "res-" + Math.random().toString(36).substr(2, 9),
                        plotId: plotId
                    });
                }, 2000);
            });
        }
        
        function playSuccessSound() {
            // يمكن استبدال هذا بصوت فعلي
            console.log('🔔 تشغيل صوت النجاح');
            try {
                const audio = new Audio('data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU...');
                audio.volume = 0.3;
                audio.play();
            } catch (e) {
                console.log('لا يمكن تشغيل الصوت');
            }
        }
    </script>
</body>
</html>
```

## كيفية عمل النظام:

1. **زر واحد سحري**:
   - يقوم بكل العمليات تلقائياً بضغطة واحدة
   - يبحث عن القطع المخفية والمؤرشفة
   - يحاول حجز أول قطعة متاحة
