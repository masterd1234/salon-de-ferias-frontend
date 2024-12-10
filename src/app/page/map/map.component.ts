import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, Inject, OnInit, PLATFORM_ID, ViewChild, OnDestroy } from '@angular/core';
import * as BABYLON from 'babylonjs';
import 'babylonjs-loaders';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css'],
})
export class MapComponent implements OnInit, OnDestroy {
  @ViewChild('renderCanvas', { static: true }) canvasRef!: ElementRef;

  private engine!: BABYLON.Engine;
  private scene!: BABYLON.Scene;
  private camera!: BABYLON.ArcRotateCamera;
  private light!: BABYLON.HemisphericLight;
  private resizeObserver!: () => void;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeScene();
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      if (this.engine) {
        this.engine.dispose();
      }
      if (this.resizeObserver) {
        window.removeEventListener('resize', this.resizeObserver);
      }
    }
  }

  private initializeScene(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    try {
      const canvas = this.canvasRef.nativeElement as HTMLCanvasElement;

      this.engine = new BABYLON.Engine(canvas, true);
      this.scene = new BABYLON.Scene(this.engine);

      this.setupCameraAndLight(canvas);
      this.createGround();
      this.createStands();

      this.engine.runRenderLoop(() => {
        this.scene.render();
      });

      this.resizeObserver = () => {
        this.engine.resize();
      };
      window.addEventListener('resize', this.resizeObserver);
    } catch (error) {
      console.error('Error al inicializar la escena de Babylon.js:', error);
    }
  }

  private setupCameraAndLight(canvas: HTMLCanvasElement): void {
    this.camera = new BABYLON.ArcRotateCamera(
      'camera',
      Math.PI / -2, //angulo de rotacion, si se mueve girará para izquierda o derecha
      Math.PI / 3, //angulo de vista
      120, //distancia de la camara
      new BABYLON.Vector3(0, 0, 0),
      this.scene
    );

    this.camera.attachControl(canvas, false);
    this.camera.inputs.clear();
    this.light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), this.scene);
    this.light.intensity = 0.9;
  }

  private createGround(): void {
    const ground = BABYLON.MeshBuilder.CreateGround('ground', { width: 150, height: 150 }, this.scene);
    const groundMaterial = new BABYLON.StandardMaterial('groundMaterial', this.scene);
    groundMaterial.diffuseTexture = new BABYLON.Texture('../../../assets/render.png', this.scene);
    ground.material = groundMaterial;
  }

  private createStands(): void {
    const standsData = [
      { name: 'Empresa 1', standLogo: '../../../assets/stand1.png', floorLogo: '../../../assets/logo.png' },
      { name: 'Empresa 2', standLogo: '../../../assets/stand2.png', floorLogo: '../../../assets/logo_MD.png' },
      { name: 'Empresa 3', standLogo: '../../../assets/stand3.png', floorLogo: '../../../assets/logo.png' },
      { name: 'Empresa 4', standLogo: '../../../assets/stand4.png', floorLogo: '../../../assets/logo.png' },
      { name: 'Empresa 5', standLogo: '../../../assets/stand6.png', floorLogo: '../../../assets/logo.png' },
      { name: 'Empresa 6', standLogo: '../../../assets/stand7.png', floorLogo: '../../../assets/logo.png' },
      { name: 'Empresa 7', standLogo: '../../../assets/stand8.png', floorLogo: '../../../assets/logo.png' },
      //segunda linea de stands
      { name: 'Empresa 8', standLogo: '../../../assets/stand9.png', floorLogo: '../../../assets/logo.png' },
      { name: 'Empresa 9', standLogo: '../../../assets/stand10.png', floorLogo: '../../../assets/logo.png' },
      { name: 'Empresa 10', standLogo: '../../../assets/stand10.png', floorLogo: '../../../assets/logo.png' },
      { name: 'Empresa 11', standLogo: '../../../assets/stand9.png', floorLogo: '../../../assets/logo_MD.png' },
      { name: 'Empresa 12', standLogo: '../../../assets/stand8.png', floorLogo: '../../../assets/logo.png' },
      { name: 'Empresa 13', standLogo: '../../../assets/stand7.png', floorLogo: '../../../assets/logo_MD.png' },
      { name: 'Empresa 14', standLogo: '../../../assets/stand6.png', floorLogo: '../../../assets/logo.png' },
      //tercera linea de stands
      { name: 'Empresa 8', standLogo: '../../../assets/stand5.png', floorLogo: '../../../assets/logo_MD.png' },
      { name: 'Empresa 9', standLogo: '../../../assets/stand4.png', floorLogo: '../../../assets/logo_MD.png' },
      { name: 'Empresa 10', standLogo: '../../../assets/stand3.png', floorLogo: '../../../assets/logo.png' },
      { name: 'Empresa 11', standLogo: '../../../assets/stand2.png', floorLogo: '../../../assets/logo_MD.png' },
      { name: 'Empresa 12', standLogo: '../../../assets/stand1.png', floorLogo: '../../../assets/logo.png' },
      { name: 'Empresa 13', standLogo: '../../../assets/stand3.png', floorLogo: '../../../assets/logo_MD.png' },
      { name: 'Empresa 14', standLogo: '../../../assets/stand8.png', floorLogo: '../../../assets/logo.png' },
    ];

    const spacing = 10; // Espacio entre stands
    const rowWidth = 7; // Máximo de stands por fila
    standsData.forEach((stand, index) => {
      const row = Math.floor(index / rowWidth);
      const col = index % rowWidth;
      const position = new BABYLON.Vector3(col * spacing - 30, 0, -row * spacing - 10);
      this.createStandWithBase(position, stand.name, stand.standLogo, stand.floorLogo);
    });
  }

  private createStandWithBase(
    position: BABYLON.Vector3,
    name: string,
    standLogoUrl: string,
    floorLogoUrl: string
  ): void {
    const base = BABYLON.MeshBuilder.CreateGround(`${name}-base`, { width: 6, height: 6 }, this.scene);
    base.position = new BABYLON.Vector3(position.x, 0.01, position.z);
    const baseMaterial = new BABYLON.StandardMaterial(`${name}-baseMaterial`, this.scene);
    baseMaterial.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.7);
    base.material = baseMaterial;

    // Modificación para que el stand se vea más realista
    const stand = BABYLON.MeshBuilder.CreatePlane(`${name}-stand`, { width: 4, height: 6 }, this.scene);
    stand.position = new BABYLON.Vector3(position.x, 3, position.z ); // Posicionar ligeramente hacia adelante
    stand.rotation = new BABYLON.Vector3(BABYLON.Tools.ToRadians(-15), 0, 0); // Inclinación hacia la cámara
    const standMaterial = new BABYLON.StandardMaterial(`${name}-standMaterial`, this.scene);
    standMaterial.diffuseTexture = new BABYLON.Texture(standLogoUrl, this.scene);
    standMaterial.backFaceCulling = false;
    stand.material = standMaterial;

    // Logo en el suelo
    const floorLogo = BABYLON.MeshBuilder.CreatePlane(`${name}-floorLogo`, { width: 4, height: 2 }, this.scene);
    floorLogo.position = new BABYLON.Vector3(position.x, 0.02, position.z - 1);
    floorLogo.rotation.x = Math.PI / 2;
    const floorLogoMaterial = new BABYLON.StandardMaterial(`${name}-floorLogoMaterial`, this.scene);
    floorLogoMaterial.diffuseTexture = new BABYLON.Texture(floorLogoUrl, this.scene);
    floorLogoMaterial.backFaceCulling = false;
    floorLogo.material = floorLogoMaterial;
  }
}
