import { generateCode } from '../../../src/screens/TransportCodeScreen/utils/generateCode';

describe('generateCode', () => {
  let setProjectError: jest.Mock;
  let setDateError: jest.Mock;
  let setRutError: jest.Mock;
  let setGeneratedCode: jest.Mock;
  let setShowResult: jest.Mock;

  beforeEach(() => {
    setProjectError = jest.fn();
    setDateError = jest.fn();
    setRutError = jest.fn();
    setGeneratedCode = jest.fn();
    setShowResult = jest.fn();
  });

  describe('Specific test cases', () => {
    it('Case 1: Project 10000, Date 12/12/2024, RUT 126552424 should generate code 18170', () => {
      generateCode(
        '10000',
        '12/12/2024',
        '126552424',
        setProjectError,
        setDateError,
        setRutError,
        setGeneratedCode,
        setShowResult
      );

      expect(setProjectError).toHaveBeenCalledWith('');
      expect(setDateError).toHaveBeenCalledWith('');
      expect(setRutError).toHaveBeenCalledWith('');
      expect(setGeneratedCode).toHaveBeenCalledWith('18170');
      expect(setShowResult).toHaveBeenCalledWith(true);
    });

    it('Case 2: Project 15000, Date 12/12/2024, RUT 126552424 should generate code 12420', () => {
      generateCode(
        '15000',
        '12/12/2024',
        '126552424',
        setProjectError,
        setDateError,
        setRutError,
        setGeneratedCode,
        setShowResult
      );

      expect(setProjectError).toHaveBeenCalledWith('');
      expect(setDateError).toHaveBeenCalledWith('');
      expect(setRutError).toHaveBeenCalledWith('');
      expect(setGeneratedCode).toHaveBeenCalledWith('12420');
      expect(setShowResult).toHaveBeenCalledWith(true);
    });

    it('Case 3: Project 15000, Date 12/03/2025, RUT 126552424 should generate code 13102', () => {
      generateCode(
        '15000',
        '12/03/2025',
        '126552424',
        setProjectError,
        setDateError,
        setRutError,
        setGeneratedCode,
        setShowResult
      );

      expect(setProjectError).toHaveBeenCalledWith('');
      expect(setDateError).toHaveBeenCalledWith('');
      expect(setRutError).toHaveBeenCalledWith('');
      expect(setGeneratedCode).toHaveBeenCalledWith('13102');
      expect(setShowResult).toHaveBeenCalledWith(true);
    });

    it('Case 4: Project 15000, Date 12/03/2025, RUT 204660247 should generate code 11717', () => {
      generateCode(
        '15000',
        '12/03/2025',
        '204660247',
        setProjectError,
        setDateError,
        setRutError,
        setGeneratedCode,
        setShowResult
      );

      expect(setProjectError).toHaveBeenCalledWith('');
      expect(setDateError).toHaveBeenCalledWith('');
      expect(setRutError).toHaveBeenCalledWith('');
      expect(setGeneratedCode).toHaveBeenCalledWith('11717');
      expect(setShowResult).toHaveBeenCalledWith(true);
    });
  });

  describe('Error handling', () => {
    it('should call setProjectError when project value is invalid', () => {
      generateCode(
        '',
        '12/12/2024',
        '126552424',
        setProjectError,
        setDateError,
        setRutError,
        setGeneratedCode,
        setShowResult
      );

      expect(setProjectError).toHaveBeenCalled();
      expect(setGeneratedCode).not.toHaveBeenCalled();
      expect(setShowResult).not.toHaveBeenCalled();
    });

    it('should call setDateError when date is invalid', () => {
      generateCode(
        '10000',
        '',
        '126552424',
        setProjectError,
        setDateError,
        setRutError,
        setGeneratedCode,
        setShowResult
      );

      expect(setDateError).toHaveBeenCalled();
      expect(setGeneratedCode).not.toHaveBeenCalled();
      expect(setShowResult).not.toHaveBeenCalled();
    });

    it('should call setRutError when RUT is invalid', () => {
      generateCode(
        '10000',
        '12/12/2024',
        '',
        setProjectError,
        setDateError,
        setRutError,
        setGeneratedCode,
        setShowResult
      );

      expect(setRutError).toHaveBeenCalled();
      expect(setGeneratedCode).not.toHaveBeenCalled();
      expect(setShowResult).not.toHaveBeenCalled();
    });
  });

  describe('Function behavior', () => {
    it('should not generate code when any validation fails', () => {
      generateCode(
        'invalid',
        '12/12/2024',
        '126552424',
        setProjectError,
        setDateError,
        setRutError,
        setGeneratedCode,
        setShowResult
      );

      expect(setGeneratedCode).not.toHaveBeenCalled();
      expect(setShowResult).not.toHaveBeenCalled();
    });

    it('should call setShowResult with true when code is generated successfully', () => {
      generateCode(
        '10000',
        '12/12/2024',
        '126552424',
        setProjectError,
        setDateError,
        setRutError,
        setGeneratedCode,
        setShowResult
      );

      expect(setShowResult).toHaveBeenCalledWith(true);
    });
  });
});
